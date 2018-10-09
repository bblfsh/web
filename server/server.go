package server

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gopkg.in/bblfsh/client-go.v3"
	"gopkg.in/bblfsh/client-go.v3/tools"
	protocol1 "gopkg.in/bblfsh/sdk.v1/protocol"
	"gopkg.in/bblfsh/sdk.v2/protocol"
	"gopkg.in/bblfsh/sdk.v2/uast/nodes"
)

type Server struct {
	addr       string
	client     *bblfsh.Client
	httpClient *http.Client
	version    string
}

// New return a new Server
func New(addr string, version string) (*Server, error) {
	return &Server{
		addr:       addr,
		version:    version,
		httpClient: &http.Client{Timeout: 5 * time.Second},
	}, nil
}

func (s *Server) bblfshClient() (*bblfsh.Client, error) {
	if s.client == nil {
		var err error
		s.client, err = bblfsh.NewClient(s.addr)
		if err != nil {
			return nil, fmt.Errorf("Can't connect to bblfsh server: %s", err)
		}
	}

	return s.client, nil
}

// Mount return a router listening for frontend requests
func Mount(s *Server, r gin.IRouter) gin.IRouter {
	r.POST("/parse", s.handleParse)
	r.POST("/drivers", s.handleSupportedLanguages)
	r.GET("/gist", s.handleLoadGist)
	r.POST("/version", s.handleVersion)
	return r
}

type request struct {
	ServerURL string `json:"server_url"`
}

type parseRequest struct {
	request
	Language string `json:"language"`
	Filename string `json:"filename"`
	Content  string `json:"content"`
	Query    string `json:"query"`
}

const rootNodeID uint64 = 1

func (s *Server) handleParse(ctx *gin.Context) {
	var req parseRequest
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, jsonError("unable to read request: %s", err))
		return
	}

	cli, err := s.clientForRequest(req.request)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, jsonError("error starting client: %s", err))
		return
	}

	resp, err := cli.NewParseRequest().
		Language(req.Language).
		Filename(req.Filename).
		Content(req.Content).
		Do()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, jsonError("error parsing UAST: %s", err))
		return
	}

	var tree map[uint64]nodes.Node

	if resp.Uast != nil && req.Query != "" {
		n, _ := resp.Nodes()

		iter, err := tools.Filter(n, req.Query)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, jsonError("error filtering UAST: %s", err))
			return
		}

		var results nodes.Array
		var i = rootNodeID + 1
		tree = make(map[uint64]nodes.Node)
		for iter.Next() {
			results = append(results, nodes.Int(i))
			// TODO: need to transform children nodes
			tree[i] = iter.Node().(nodes.Node)
			i++
		}

		tree[rootNodeID] = nodes.Object{
			"InternalType": nodes.String("Dashboard: Search results"),
			"Children":     results,
		}
	} else {
		tree, err = readAsFlatTree(bytes.NewReader(resp.Uast))
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, jsonError("error flatting UAST: %s", err))
		}
	}

	ctx.JSON(http.StatusOK, parseResp{
		Errors:   resp.Errors,
		Language: resp.Language,
		Uast:     tree,
	})
}

type parseResp struct {
	Errors   []*protocol.ParseError `json:"errors"`
	Language string                 `json:"language"`
	Uast     map[uint64]nodes.Node  `json:"uast"`
}

func (s *Server) clientForRequest(req request) (*bblfsh.Client, error) {
	if req.ServerURL == "" {
		return s.bblfshClient()
	}

	return bblfsh.NewClient(req.ServerURL)
}

// MakeGistURL makes url to github's gist
// export to allow mocking in test
var MakeGistURL = func(u string) string {
	return "https://gist.githubusercontent.com/" + u
}

func (s *Server) handleLoadGist(ctx *gin.Context) {
	resp, err := s.httpClient.Get(MakeGistURL(ctx.Query("url")))
	if err != nil {
		ctx.JSON(http.StatusNotFound, jsonError("Gist not found: %s", err))
		return
	}
	if resp.StatusCode != http.StatusOK {
		ctx.JSON(http.StatusNotFound, jsonError("Gist not found"))
		return
	}
	defer resp.Body.Close()

	gistContent, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, jsonError("Could not read gist: %s", err))
		return
	}

	ctx.String(resp.StatusCode, string(gistContent))
}

type versionRequest struct {
	request
}

func (s *Server) handleVersion(ctx *gin.Context) {
	var req versionRequest
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, jsonError("unable to read request: %s", err))
		return
	}

	cli, err := s.clientForRequest(req.request)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, jsonError("error starting client: %s", err))
		return
	}

	resp, err := cli.NewVersionRequest().Do()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, jsonError("error getting server version: %s", err))
		return
	}

	ctx.JSON(http.StatusOK, map[string]string{
		"webClient": s.version,
		"server":    resp.Version,
	})
}

func jsonError(msg string, args ...interface{}) gin.H {
	return gin.H{
		"status": protocol1.Fatal,
		"errors": []gin.H{
			gin.H{
				"message": fmt.Sprintf(msg, args...),
			},
		},
	}
}
