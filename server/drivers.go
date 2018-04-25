package server

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"regexp"
	"strings"
	"time"
	"unicode"

	bblfshProtocol "github.com/bblfsh/bblfshd/daemon/protocol"
	"github.com/gin-gonic/gin"
	"google.golang.org/grpc"
)

// Driver as it will be seen in the frontend
type Driver struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	URL  string `json:"url"`
}

// DefaultBblfshdCtlPort is the default port for the bblfsh control network
const DefaultBblfshdCtlPort = 9433

var dockerImageRegExp = regexp.MustCompile("^docker://([^:]+)")

var addressPortRegExp = regexp.MustCompile("^([^:]+):.+")

func (s *Server) handleListDrivers(ctx *gin.Context) {
	var req versionRequest
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, jsonError("unable to read request: %s", err))
		return
	}

	cli, err := s.ctlClientForRequest(req.request)
	if cli == nil || err != nil {
		ctx.JSON(http.StatusInternalServerError, jsonError("error starting client: %s", err))
		return
	}

	drivers, err := fetchDrivers(ctx, cli)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, jsonError("unable to get the installed drivers: %s", err))
		return
	}

	ctx.JSON(http.StatusOK, driverStatusToDrivers(drivers))
}

func (s *Server) ctlClientForRequest(req request) (bblfshProtocol.ProtocolServiceClient, error) {
	if req.ServerURL == "" {
		return s.ctlClient, nil
	}

	bblfshCtlAddr, err := GetCtlAddr(req.ServerURL)
	if err != nil {
		return nil, fmt.Errorf("can not build control address: %s", err)
	}

	return getCtlClient(bblfshCtlAddr)
}

// GetCtlAddr returns the control address given a bblfsh address replacing the
// port from the input address with the default control port
func GetCtlAddr(bblfshAddr string) (string, error) {
	parts := addressPortRegExp.FindStringSubmatch(bblfshAddr)
	if len(parts) < 2 {
		return "", fmt.Errorf("no valid bblfsh address")
	}

	return fmt.Sprintf("%s:%d", parts[1], DefaultBblfshdCtlPort), nil
}

func fetchDrivers(ctx context.Context, cli bblfshProtocol.ProtocolServiceClient) ([]*bblfshProtocol.DriverImageState, error) {
	driversRequest := bblfshProtocol.DriverStatesRequest{}
	driversResponse, err := cli.DriverStates(ctx, &driversRequest)
	if err != nil {
		return nil, fmt.Errorf("error getting server drivers: %s", err)
	}

	if len(driversResponse.Errors) > 0 {
		errors := strings.Join(driversResponse.Errors, "; ")
		return nil, fmt.Errorf("unexpected error: %s", errors)
	}

	return driversResponse.State, nil
}

func getCtlClient(address string) (bblfshProtocol.ProtocolServiceClient, error) {
	con, err := grpc.Dial(address,
		grpc.WithDialer(func(addr string, t time.Duration) (net.Conn, error) {
			return net.DialTimeout("tcp", address, t)
		}),
		grpc.WithBlock(),
		grpc.WithTimeout(5*time.Second),
		grpc.WithInsecure(),
	)
	if err != nil {
		return nil, err
	}

	return bblfshProtocol.NewProtocolServiceClient(con), nil
}

func driverStatusToDrivers(driverImages []*bblfshProtocol.DriverImageState) []Driver {
	drivers := make([]Driver, len(driverImages))
	for i, driver := range driverImages {
		url, _ := GitHubURLFromDockerReference(driver.Reference)
		drivers[i] = Driver{
			ID:   driver.Language,
			Name: UcFirst(driver.Language),
			URL:  url,
		}
	}

	return drivers
}

// UcFirst capitalizes the first letter of the passed string
func UcFirst(t string) string {
	if len(t) == 0 {
		return ""
	}

	firstLetter := string(unicode.ToUpper([]rune(t[:1])[0]))
	if len(t) == 1 {
		return firstLetter
	}

	return firstLetter + t[1:]
}

// GitHubURLFromDockerReference returns the driver github repository url of the
// passed driver docker image url
func GitHubURLFromDockerReference(t string) (string, error) {
	parts := dockerImageRegExp.FindStringSubmatch(t)
	if len(parts) < 2 {
		return "", fmt.Errorf("no docker reference")
	}

	return "https://github.com/" + parts[1], nil
}
