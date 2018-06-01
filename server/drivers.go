package server

import (
	"fmt"
	"net/http"
	"regexp"

	"github.com/gin-gonic/gin"
	"gopkg.in/bblfsh/sdk.v1/protocol"
)

// Driver as it will be seen in the frontend
type Driver struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	URL  string `json:"url"`
}

const driverRepoURLPattern = "https://github.com/bblfsh/%s-driver"

var dockerImageRegExp = regexp.MustCompile("^docker://([^:]+)")

func (s *Server) handleSupportedLanguages(ctx *gin.Context) {
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

	resp, err := cli.NewSupportedLanguagesRequest().Do()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, jsonError("error getting server drivers: %s", err))
		return
	}

	ctx.JSON(toHTTPStatus(resp.Status), driverManifestToDrivers(resp.Languages))
}

func driverManifestToDrivers(drivers []protocol.DriverManifest) []Driver {
	result := make([]Driver, len(drivers))

	for i, driver := range drivers {
		result[i] = Driver{
			ID:   driver.Language,
			Name: driver.Name,
			URL:  driverRepoURL(driver.Language),
		}
	}

	return result
}

func driverRepoURL(lang string) string {
	return fmt.Sprintf(driverRepoURLPattern, lang)
}
