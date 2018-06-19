package server_test

import (
	"io"
	"net"
	"net/http"
	"net/http/httptest"

	"github.com/bblfsh/dashboard/server"

	"github.com/gin-gonic/gin"
	"google.golang.org/grpc"
	"gopkg.in/bblfsh/sdk.v1/protocol"
)

func request(
	s protocol.Service,
	method string,
	url string,
	body io.Reader,
) (
	*httptest.ResponseRecorder,
	error,
) {
	grpcServer, addr, err := runBblfsh(s)
	if err != nil {
		return nil, err
	}
	defer grpcServer.GracefulStop()

	srv, err := server.New(addr, "dashboard-ver")
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

func runBblfsh(s protocol.Service) (*grpc.Server, string, error) {
	protocol.DefaultService = s
	lis, err := net.Listen("tcp", "localhost:0")
	if err != nil {
		return nil, "", err
	}

	gs := grpc.NewServer()
	protocol.RegisterProtocolServiceServer(
		gs,
		protocol.NewProtocolServiceServer(),
	)
	go gs.Serve(lis)

	return gs, lis.Addr().String(), nil
}

func runGin(s *server.Server) (*gin.Engine, error) {
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	server.Mount(s, r.Group("/api"))

	return r, nil
}

type bblfshServiceMock struct {
	ParseFunc              func(*protocol.ParseRequest) *protocol.ParseResponse
	NativeParseFunc        func(*protocol.NativeParseRequest) *protocol.NativeParseResponse
	VersionFunc            func(*protocol.VersionRequest) *protocol.VersionResponse
	SupportedLanguagesFunc func(*protocol.SupportedLanguagesRequest) *protocol.SupportedLanguagesResponse
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
func (c *bblfshServiceMock) SupportedLanguages(req *protocol.SupportedLanguagesRequest) *protocol.SupportedLanguagesResponse {
	return c.SupportedLanguagesFunc(req)
}
