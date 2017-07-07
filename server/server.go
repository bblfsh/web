package server

import (
	"fmt"
	"net/http"
	"time"

	"google.golang.org/grpc"

	"github.com/bblfsh/sdk/protocol"
	"github.com/gin-gonic/gin"
)

type Server struct {
	client protocol.ProtocolServiceClient
}

func New(addr string) (*Server, error) {
	conn, err := grpc.Dial(
		addr,
		grpc.WithInsecure(),
		grpc.WithTimeout(time.Second*10),
	)
	if err != nil {
		return nil, err
	}

	client := protocol.NewProtocolServiceClient(conn)
	return &Server{client}, nil
}

func (s *Server) HandleParse(ctx *gin.Context) {
	var req protocol.ParseRequest
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, jsonError("unable to read request: %s", err))
		return
	}

	resp, err := s.client.Parse(ctx.Request.Context(), &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, jsonError("error parsing UAST: %s", err))
		return
	}

	ctx.JSON(toHTTPStatus(resp.Status), resp)
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
