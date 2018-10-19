package server_test

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/bblfsh/web/server"
	"github.com/stretchr/testify/require"
	bblfsh "gopkg.in/bblfsh/client-go.v3"
	protocol1 "gopkg.in/bblfsh/sdk.v1/protocol"
	"gopkg.in/bblfsh/sdk.v2/protocol"
	"gopkg.in/bblfsh/sdk.v2/uast/nodes"
	"gopkg.in/bblfsh/sdk.v2/uast/nodes/nodesproto"
)

var serverUAST = nodes.Object{
	"@type":  nodes.String("uast:File"),
	"@roles": nodes.Array{nodes.String("File")},
	"children": nodes.Array{
		nodes.Object{"@type": nodes.String("uast:String")},
		nodes.Object{"@type": nodes.String("uast:String")},
	},
}

var serverUASTBytes []byte

func init() {
	buff := bytes.NewBuffer([]byte{})
	nodesproto.WriteTo(buff, serverUAST)
	serverUASTBytes = buff.Bytes()
}

func TestHandleParseSuccess(t *testing.T) {
	var req *protocol.ParseRequest

	require := require.New(t)
	s := &parseMock{
		ParseFunc: func(r *protocol.ParseRequest) (*protocol.ParseResponse, error) {
			req = r
			return &protocol.ParseResponse{
				Language: "python",
				Uast:     serverUASTBytes,
			}, nil
		},
	}

	input := `{"mode": "semantic", "language": "python", "filename": "file.py", "content": "foo = 1"}`
	w, err := requestParse(s, "POST", "/api/parse", strings.NewReader(input))
	require.Nil(err)
	require.Equal(http.StatusOK, w.Code)
	// check correct input parsing
	require.Equal("python", req.Language)
	require.Equal("file.py", req.Filename)
	require.Equal("foo = 1", req.Content)
	require.Equal(bblfsh.Semantic, req.Mode)
	// check resp transformation
	require.JSONEq(`{
		"language": "python",
		"uast": {
			"@type": "uast:File",
			"@roles": ["File"],
			"children": [
				{"@type": "uast:String"},
				{"@type": "uast:String"}
			]
		}
	}`, w.Body.String())
}

func TestHandleParseWithQuerySuccess(t *testing.T) {
	require := require.New(t)
	s := &parseMock{
		ParseFunc: func(r *protocol.ParseRequest) (*protocol.ParseResponse, error) {
			return &protocol.ParseResponse{
				Language: "python",
				Uast:     serverUASTBytes,
			}, nil
		},
	}

	input := `{"mode": "semantic", "filename": "file.py", "content": "foo = 1", "query": "//uast:String"}`
	w, err := requestParse(s, "POST", "/api/parse", strings.NewReader(input))
	require.Nil(err)
	require.Equal(http.StatusOK, w.Code)
	require.JSONEq(`{
		"language": "python",
		"uast": [
			{"@type": "uast:String"},
			{"@type": "uast:String"}
		]
	}`, w.Body.String())
}

func TestLoadGistSuccess(t *testing.T) {
	require := require.New(t)

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/path/to/correct/gist" {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("ok"))
			return
		}
		w.WriteHeader(http.StatusNotFound)
	}))
	defer ts.Close()

	origURLMaker := server.MakeGistURL
	server.MakeGistURL = func(p string) string {
		return ts.URL + "/" + p
	}

	w, err := request("", "GET", "/api/gist?url=path/to/correct/gist", nil)
	require.Nil(err)
	require.Equal(http.StatusOK, w.Code)
	require.Equal("ok", w.Body.String())

	w, err = request("", "GET", "/api/gist?url=does/not/exists", nil)
	require.Nil(err)
	require.Equal(http.StatusNotFound, w.Code)
	require.JSONEq(`{"status": 2, "errors": [{"message": "Gist not found"}]}`, w.Body.String())

	server.MakeGistURL = origURLMaker
}

func TestVersionsSuccess(t *testing.T) {
	require := require.New(t)
	s := &bblfshServiceMock{
		VersionFunc: func(*protocol1.VersionRequest) *protocol1.VersionResponse {
			return &protocol1.VersionResponse{
				Response: protocol1.Response{Status: protocol1.Ok},
				Version:  "server-ver",
			}
		},
	}

	w, err := requestV1(s, "POST", "/api/version", strings.NewReader("{}"))
	require.Nil(err)
	require.Equal(http.StatusOK, w.Code)
	require.JSONEq(`{"webClient": "web-ver", "server": "server-ver"}`, w.Body.String())
}

func TestHandleVersionsError(t *testing.T) {
	require := require.New(t)
	s := &bblfshServiceMock{
		VersionFunc: func(*protocol1.VersionRequest) *protocol1.VersionResponse {
			return &protocol1.VersionResponse{
				Response: protocol1.Response{Status: protocol1.Fatal},
			}
		},
	}

	w, err := requestV1(s, "POST", "/api/version", strings.NewReader("{}"))
	require.Nil(err)
	require.Equal(http.StatusInternalServerError, w.Code)
}

func TestCustomBblfshServer(t *testing.T) {
	require := require.New(t)

	// run normal servers
	s := &bblfshServiceMock{}
	grpcServer, addr, err := runBblfsh(nil, s)
	require.Nil(err)
	defer grpcServer.GracefulStop()
	srv, err := server.New(addr, "web-ver")
	require.Nil(err)
	r, err := runGin(srv)
	require.Nil(err)

	// run custom server
	s = &bblfshServiceMock{
		VersionFunc: func(*protocol1.VersionRequest) *protocol1.VersionResponse {
			return &protocol1.VersionResponse{
				Response: protocol1.Response{Status: protocol1.Ok},
				Version:  "custom-ver",
			}
		},
	}

	customGrpcServer, customAddr, err := runBblfsh(nil, s)
	require.Nil(err)
	defer customGrpcServer.GracefulStop()

	input := `{"server_url": "` + customAddr + `"}`
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/version", strings.NewReader(input))
	r.ServeHTTP(w, req)

	require.Equal(http.StatusOK, w.Code)
	require.JSONEq(`{"webClient": "web-ver", "server": "custom-ver"}`, w.Body.String())
}
