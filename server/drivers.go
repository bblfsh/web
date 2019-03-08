package server

import (
	"fmt"
	"net/http"
	"regexp"

	"github.com/gin-gonic/gin"
	bblfsh "gopkg.in/bblfsh/client-go.v3"
)

// Driver as it will be seen in the frontend
type Driver struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	URL     string `json:"url"`
	Version string `json:"version"`
}

type supportedLanguagesRequest struct {
	request
}

const driverRepoURLPattern = "https://github.com/bblfsh/%s-driver"

var dockerImageRegExp = regexp.MustCompile("^docker://([^:]+)")

func (s *Server) handleSupportedLanguages(ctx *gin.Context) {
	var req supportedLanguagesRequest
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

	ctx.JSON(http.StatusOK, driverManifestToDrivers(resp))
}

func driverManifestToDrivers(drivers []bblfsh.DriverManifest) []Driver {
	result := make([]Driver, len(drivers))

	for i, driver := range drivers {
		result[i] = Driver{
			ID:      driver.Language,
			Name:    driver.Name,
			URL:     driverRepoURL(driver.Language),
			Version: driver.Version,
		}
	}

	return result
}

func driverRepoURL(lang string) string {
	return fmt.Sprintf(driverRepoURLPattern, lang)
}
