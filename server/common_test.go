package server_test

import (
	"io"
	"net"
	"net/http"
	"net/http/httptest"

	"github.com/bblfsh/web/server"
	"github.com/gin-gonic/gin"
	xcontext "golang.org/x/net/context"
	"google.golang.org/grpc"
	protocol1 "gopkg.in/bblfsh/sdk.v1/protocol"
	"gopkg.in/bblfsh/sdk.v2/protocol"
)

func requestParse(
	s protocol.DriverServer,
	method string,
	url string,
	body io.Reader,
) (
	*httptest.ResponseRecorder,
	error,
) {
	grpcServer, addr, err := runBblfsh(s, nil)
	if err != nil {
		return nil, err
	}
	defer grpcServer.GracefulStop()

	return request(addr, method, url, body)
}

func requestV1(
	s protocol1.Service,
	method string,
	url string,
	body io.Reader,
) (
	*httptest.ResponseRecorder,
	error,
) {
	grpcServer, addr, err := runBblfsh(nil, s)
	if err != nil {
		return nil, err
	}
	defer grpcServer.GracefulStop()

	return request(addr, method, url, body)
}

func request(
	addr string,
	method string,
	url string,
	body io.Reader,
) (
	*httptest.ResponseRecorder,
	error,
) {
	srv, err := server.New(addr, "web-ver")
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

func runBblfsh(s1 protocol.DriverServer, s2 protocol1.Service) (*grpc.Server, string, error) {
	lis, err := net.Listen("tcp", "localhost:0")
	if err != nil {
		return nil, "", err
	}

	gs := grpc.NewServer()
	if s1 != nil {
		protocol.RegisterDriverServer(gs, s1)
	}
	if s2 != nil {
		protocol1.DefaultService = s2
		protocol1.RegisterProtocolServiceServer(
			gs,
			protocol1.NewProtocolServiceServer(),
		)
	}
	go gs.Serve(lis)

	return gs, lis.Addr().String(), nil
}

func runGin(s *server.Server) (*gin.Engine, error) {
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	server.Mount(s, r.Group("/api"))

	return r, nil
}

type parseMock struct {
	ParseFunc func(*protocol.ParseRequest) (*protocol.ParseResponse, error)
}

func (c *parseMock) Parse(ctx xcontext.Context, req *protocol.ParseRequest) (resp *protocol.ParseResponse, gerr error) {
	return c.ParseFunc(req)
}

var _ protocol.DriverServer = (*parseMock)(nil)

type bblfshServiceMock struct {
	VersionFunc            func(*protocol1.VersionRequest) *protocol1.VersionResponse
	SupportedLanguagesFunc func(*protocol1.SupportedLanguagesRequest) *protocol1.SupportedLanguagesResponse
}

func (c *bblfshServiceMock) Version(req *protocol1.VersionRequest) *protocol1.VersionResponse {
	return c.VersionFunc(req)
}
func (c *bblfshServiceMock) SupportedLanguages(req *protocol1.SupportedLanguagesRequest) *protocol1.SupportedLanguagesResponse {
	return c.SupportedLanguagesFunc(req)
}

// deprecated methods
func (c *bblfshServiceMock) Parse(req *protocol1.ParseRequest) *protocol1.ParseResponse {
	return nil
}
func (c *bblfshServiceMock) NativeParse(req *protocol1.NativeParseRequest) *protocol1.NativeParseResponse {
	return nil
}

var _ protocol1.Service = (*bblfshServiceMock)(nil)
