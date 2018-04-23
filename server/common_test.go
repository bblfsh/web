package server_test

import (
	"io"
	"net"
	"net/http"
	"net/http/httptest"

	"github.com/bblfsh/dashboard/server"

	bblfshProtocol "github.com/bblfsh/bblfshd/daemon/protocol"
	"github.com/gin-gonic/gin"
	"google.golang.org/grpc"
	"gopkg.in/bblfsh/sdk.v1/protocol"
)

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
