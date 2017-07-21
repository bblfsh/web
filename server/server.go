package server

import (
	"fmt"
	"io"
	"net/http"
	"time"

	"google.golang.org/grpc"

	"github.com/bblfsh/sdk/protocol"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type Server struct {
	client protocol.ProtocolServiceClient
}

func newClient(addr string) (protocol.ProtocolServiceClient, io.Closer, error) {
	conn, err := grpc.Dial(
		addr,
		grpc.WithInsecure(),
		grpc.WithTimeout(time.Second*10),
	)
	if err != nil {
		return nil, nil, err
	}

	return protocol.NewProtocolServiceClient(conn), conn, nil
}

func New(addr string) (*Server, error) {
	fmt.Println("addr is", addr)
	client, _, err := newClient(addr)
	if err != nil {
		return nil, err
	}

	return &Server{client}, nil
}

type parseRequest struct {
	ServerURL string `json:"server_url"`
	Language  string `json:"language"`
	Content   string `json:"content"`
}

func (s *Server) HandleParse(ctx *gin.Context) {
	var req parseRequest
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, jsonError("unable to read request: %s", err))
		return
	}

	cli, closer, err := s.clientForRequest(req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, jsonError("error starting client: %s", err))
		return
	}

	if closer != nil {
		defer func() {
			if err := closer.Close(); err != nil {
				logrus.Errorf("error closing connection to client at %s: %s", req.ServerURL, err)
			}
		}()
	}

	resp, err := cli.Parse(ctx.Request.Context(), &protocol.ParseRequest{
		Content:  req.Content,
		Language: req.Language,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, jsonError("error parsing UAST: %s", err))
		return
	}

	ctx.JSON(toHTTPStatus(resp.Status), resp)
}

func (s *Server) clientForRequest(req parseRequest) (protocol.ProtocolServiceClient, io.Closer, error) {
	if req.ServerURL == "" {
		return s.client, nil, nil
	}

	return newClient(req.ServerURL)
}

func (s *Server) ListDrivers(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, driverList)
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
