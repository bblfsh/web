package server

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gopkg.in/bblfsh/client-go.v2"
	"gopkg.in/bblfsh/client-go.v2/tools"
	"gopkg.in/bblfsh/sdk.v1/protocol"
	"gopkg.in/bblfsh/sdk.v1/uast"
)

type Server struct {
	client     *bblfsh.Client
	httpClient *http.Client
	version    string
}

// New return a new Server
func New(addr string, version string) (*Server, error) {
	client, err := bblfsh.NewClient(addr)
	if err != nil {
		return nil, fmt.Errorf("Can't connect to bblfsh server: %s", err)
	}

	return &Server{
		client:     client,
		version:    version,
		httpClient: &http.Client{Timeout: 5 * time.Second},
	}, nil
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

	if resp.UAST != nil && req.Query != "" {
		filtered, err := tools.Filter(resp.UAST, req.Query)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, jsonError("error filtering UAST: %s", err))
			return
		}
		resp.UAST = &uast.Node{
			InternalType: "Dashboard: Search results",
			Children:     filtered,
		}
	}

	ctx.JSON(toHTTPStatus(resp.Status), (*parseResponse)(resp))
}

func (s *Server) clientForRequest(req request) (*bblfsh.Client, error) {
	if req.ServerURL == "" {
		return s.client, nil
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

	ctx.JSON(toHTTPStatus(resp.Status), map[string]string{
		"web":    s.version,
		"server": resp.Version,
	})
}

func toHTTPStatus(status protocol.Status) int {
	switch status {
	case protocol.Ok:
		return http.StatusOK
	case protocol.Error:
		return http.StatusBadRequest
	}

	return http.StatusInternalServerError
}

func jsonError(msg string, args ...interface{}) gin.H {
	return gin.H{
		"status": protocol.Fatal,
		"errors": []gin.H{
			gin.H{
				"message": fmt.Sprintf(msg, args...),
			},
		},
	}
}

type parseResponse protocol.ParseResponse

// MarshalJSON returns the JSON representation of the protocol.ParseResponse
func (r *parseResponse) MarshalJSON() ([]byte, error) {
	resp := struct {
		*protocol.ParseResponse
		UAST *node `json:"uast"`
	}{
		(*protocol.ParseResponse)(r),
		(*node)(r.UAST),
	}

	return json.Marshal(resp)
}

// Node represents a returned uast.Node
type node uast.Node

// MarshalJSON returns the JSON representation of the Node
func (n *node) MarshalJSON() ([]byte, error) {
	var nodes = make([]*node, len(n.Children))
	for i, n := range n.Children {
		nodes[i] = (*node)(n)
	}

	var roles = make([]string, len(n.Roles))
	for i, r := range n.Roles {
		roles[i] = r.String()
	}

	node := struct {
		*uast.Node
		Roles    []string
		Children []*node
	}{
		(*uast.Node)(n),
		roles,
		nodes,
	}

	return json.Marshal(node)
}
