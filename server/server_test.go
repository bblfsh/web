package server_test

import (
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/bblfsh/dashboard/server"

	bblfshProtocol "github.com/bblfsh/bblfshd/daemon/protocol"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"gopkg.in/bblfsh/sdk.v1/protocol"
	"gopkg.in/bblfsh/sdk.v1/uast"
)

var serverUAST = &uast.Node{
	InternalType: "Root",
	Roles:        []uast.Role{uast.File},
	Children: []*uast.Node{
		{InternalType: "Child1", Roles: []uast.Role{uast.Argument, uast.Import}},
		{InternalType: "Child2", Roles: []uast.Role{uast.Alias}},
	},
}

func TestHandleParseSuccess(t *testing.T) {
	var req *protocol.ParseRequest

	require := require.New(t)
	s := &bblfshServiceMock{
		ParseFunc: func(r *protocol.ParseRequest) *protocol.ParseResponse {
			req = r
			return &protocol.ParseResponse{
				Response: protocol.Response{Status: protocol.Ok},
				UAST:     serverUAST,
				Language: "python",
				Filename: "file.py",
			}
		},
	}

	input := `{"language": "python", "filename": "file.py", "content": "foo = 1"}`
	w, err := request(s, &bblfshProtocolServiceMock{}, "POST", "/api/parse", strings.NewReader(input))
	require.Nil(err)
	require.Equal(http.StatusOK, w.Code)
	// check correct input parsing
	require.Equal("python", req.Language)
	require.Equal("file.py", req.Filename)
	require.Equal("foo = 1", req.Content)
	// check resp transformation
	require.JSONEq(`{
		"status": 0,
		"errors": null,
		"elapsed": 0,
		"language": "python",
		"filename": "file.py",
		"uast": {
			"InternalType": "Root",
			"Roles": ["File"],
			"Children": [
				{"InternalType": "Child1", "Roles": ["Argument","Import"], "Children":[]},
				{"InternalType": "Child2", "Roles": ["Alias"],"Children": []}
			]
		}
	}`, w.Body.String())
}

func TestHandleParseWithQuerySuccess(t *testing.T) {
	require := require.New(t)
	s := &bblfshServiceMock{
		ParseFunc: func(r *protocol.ParseRequest) *protocol.ParseResponse {
			return &protocol.ParseResponse{
				Response: protocol.Response{Status: protocol.Ok},
				UAST:     serverUAST,
				Language: "python",
				Filename: "file.py",
			}
		},
	}

	input := `{"filename": "file.py", "content": "foo = 1", "query": "//*[@roleAlias]"}`
	w, err := request(s, &bblfshProtocolServiceMock{}, "POST", "/api/parse", strings.NewReader(input))
	require.Nil(err)
	require.Equal(http.StatusOK, w.Code)
	require.JSONEq(`{
		"status": 0,
		"errors": null,
		"elapsed": 0,
		"language": "python",
		"filename": "file.py",
		"uast": {
			"InternalType": "Dashboard: Search results",
			"Roles": [],
			"Children":[
				{"InternalType": "Child2", "Roles": ["Alias"], "Children": []}
			]
		}
	}`, w.Body.String())
}

func TestHandleParseEmptyWithQuery(t *testing.T) {
	require := require.New(t)
	s := &bblfshServiceMock{
		ParseFunc: func(r *protocol.ParseRequest) *protocol.ParseResponse {
			return &protocol.ParseResponse{
				Response: protocol.Response{Status: protocol.Ok},
			}
		},
	}

	input := `{"filename": "file.py", "content": "", "query": "//*[@roleAlias]"}`
	w, err := request(s, &bblfshProtocolServiceMock{}, "POST", "/api/parse", strings.NewReader(input))
	require.Nil(err)
	require.Equal(http.StatusOK, w.Code)
	require.JSONEq(`{
		"status": 0,
		"errors": null,
		"elapsed": 0,
		"language": "",
		"filename": "",
		"uast": null
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

	s := &bblfshServiceMock{}
	w, err := request(s, &bblfshProtocolServiceMock{}, "GET", "/api/gist?url=path/to/correct/gist", nil)
	require.Nil(err)
	require.Equal(http.StatusOK, w.Code)
	require.Equal("ok", w.Body.String())

	w, err = request(s, &bblfshProtocolServiceMock{}, "GET", "/api/gist?url=does/not/exists", nil)
	require.Nil(err)
	require.Equal(http.StatusNotFound, w.Code)
	require.JSONEq(`{"status": 2, "errors": [{"message": "Gist not found"}]}`, w.Body.String())

	server.MakeGistURL = origURLMaker
}

func TestVersionsSuccess(t *testing.T) {
	require := require.New(t)
	s := &bblfshServiceMock{
		VersionFunc: func(*protocol.VersionRequest) *protocol.VersionResponse {
			return &protocol.VersionResponse{
				Response: protocol.Response{Status: protocol.Ok},
				Version:  "server-ver",
			}
		},
	}

	w, err := request(s, &bblfshProtocolServiceMock{}, "POST", "/api/version", strings.NewReader("{}"))
	require.Nil(err)
	require.Equal(http.StatusOK, w.Code)
	require.JSONEq(`{"dashboard": "dashboard-ver", "server": "server-ver"}`, w.Body.String())
}

func TestHandleVersionsError(t *testing.T) {
	require := require.New(t)
	s := &bblfshServiceMock{
		VersionFunc: func(*protocol.VersionRequest) *protocol.VersionResponse {
			return &protocol.VersionResponse{
				Response: protocol.Response{Status: protocol.Error},
			}
		},
	}

	w, err := request(s, &bblfshProtocolServiceMock{}, "POST", "/api/version", strings.NewReader("{}"))
	require.Nil(err)
	require.Equal(http.StatusBadRequest, w.Code)
}

func TestCustomBblfshServer(t *testing.T) {
	require := require.New(t)

	// run normal servers
	s := &bblfshServiceMock{}
	grpcServer, grpcCtlServer, addr, addrCtl, err := runBblfsh(s, &bblfshProtocolServiceMock{})
	require.Nil(err)
	defer grpcServer.GracefulStop()
	defer grpcCtlServer.GracefulStop()

	srv, err := server.New(addr, addrCtl, "dashboard-ver")
	require.Nil(err)
	r, err := runGin(srv)
	require.Nil(err)

	// run custom server
	s = &bblfshServiceMock{
		VersionFunc: func(*protocol.VersionRequest) *protocol.VersionResponse {
			return &protocol.VersionResponse{
				Response: protocol.Response{Status: protocol.Ok},
				Version:  "custom-ver",
			}
		},
	}
	customGrpcServer, customGrpcCtlServer, customAddr, _, err := runBblfsh(s, &bblfshProtocolServiceMock{})
	require.Nil(err)
	defer customGrpcServer.GracefulStop()
	defer customGrpcCtlServer.GracefulStop()

	input := `{"server_url": "` + customAddr + `"}`
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/version", strings.NewReader(input))
	r.ServeHTTP(w, req)

	require.Equal(http.StatusOK, w.Code)
	require.JSONEq(`{"dashboard": "dashboard-ver", "server": "custom-ver"}`, w.Body.String())
}

func request(
	s protocol.Service,
	ctlServ bblfshProtocol.Service,
	method string,
	url string,
	body io.Reader,
) (
	*httptest.ResponseRecorder,
	error,
) {
	grpcServer, grpcCtlServer, addr, addrCtl, err := runBblfsh(s, ctlServ)
	if err != nil {
		return nil, err
	}
	defer grpcServer.GracefulStop()
	defer grpcCtlServer.GracefulStop()

	srv, err := server.New(addr, addrCtl, "dashboard-ver")
	if err != nil {
		return nil, err
	}

	r, err := runGin(srv)
	if err != nil {
		return nil, err
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(method, url, body)
	r.ServeHTTP(w, req)

	return w, nil
}

func runBblfsh(s protocol.Service, ctlServ bblfshProtocol.Service) (*grpc.Server, *grpc.Server, string, string, error) {
	protocol.DefaultService = s
	lis, err := net.Listen("tcp", "localhost:0")
	if err != nil {
		return nil, nil, "", "", err
	}

	gs := grpc.NewServer()
	protocol.RegisterProtocolServiceServer(
		gs,
		protocol.NewProtocolServiceServer(),
	)
	go gs.Serve(lis)

	bblfshProtocol.DefaultService = ctlServ
	ctlLis, err := net.Listen("tcp", "localhost:0")
	if err != nil {
		return nil, nil, "", "", err
	}

	ctlGs := grpc.NewServer()
	bblfshProtocol.RegisterProtocolServiceServer(
		ctlGs,
		bblfshProtocol.NewProtocolServiceServer(),
	)
	go ctlGs.Serve(ctlLis)

	return gs, ctlGs, lis.Addr().String(), ctlLis.Addr().String(), nil
}

func runGin(s *server.Server) (*gin.Engine, error) {
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	server.Mount(s, r.Group("/api"))

	return r, nil
}

type bblfshServiceMock struct {
	ParseFunc       func(*protocol.ParseRequest) *protocol.ParseResponse
	NativeParseFunc func(*protocol.NativeParseRequest) *protocol.NativeParseResponse
	VersionFunc     func(*protocol.VersionRequest) *protocol.VersionResponse
}

func (c *bblfshServiceMock) Parse(req *protocol.ParseRequest) *protocol.ParseResponse {
	return c.ParseFunc(req)
}
func (c *bblfshServiceMock) NativeParse(req *protocol.NativeParseRequest) *protocol.NativeParseResponse {
	return c.NativeParseFunc(req)
}
func (c *bblfshServiceMock) Version(req *protocol.VersionRequest) *protocol.VersionResponse {
	return c.VersionFunc(req)
}

type bblfshProtocolServiceMock struct {
	DriverStatesFunc         func() ([]*bblfshProtocol.DriverImageState, error)
	InstallDriverFunc        func(string, string, bool) error
	RemoveDriverFunc         func(string) error
	DriverPoolStatesFunc     func() map[string]*bblfshProtocol.DriverPoolState
	DriverInstanceStatesFunc func() ([]*bblfshProtocol.DriverInstanceState, error)
}

func (c *bblfshProtocolServiceMock) DriverStates() ([]*bblfshProtocol.DriverImageState, error) {
	return c.DriverStatesFunc()
}

func (c *bblfshProtocolServiceMock) InstallDriver(language string, image string, update bool) error {
	return c.InstallDriverFunc(language, image, update)
}

func (c *bblfshProtocolServiceMock) RemoveDriver(language string) error {
	return c.RemoveDriverFunc(language)
}

func (c *bblfshProtocolServiceMock) DriverPoolStates() map[string]*bblfshProtocol.DriverPoolState {
	return c.DriverPoolStatesFunc()
}

func (c *bblfshProtocolServiceMock) DriverInstanceStates() ([]*bblfshProtocol.DriverInstanceState, error) {
	return c.DriverInstanceStatesFunc()
}
