package server_test

import (
	"fmt"
	"net/http"
	"strings"
	"testing"

	bblfshProtocol "github.com/bblfsh/bblfshd/daemon/protocol"
	"github.com/bblfsh/dashboard/server"
	"github.com/stretchr/testify/require"
)

func TestDriversSuccess(t *testing.T) {
	require := require.New(t)

	diver1 := &bblfshProtocol.DriverImageState{
		Reference: "docker://bblfsh/python-driver",
		Language:  "python",
		Version:   "v.1",
	}
	driver1_exp := `{"id":"python","name":"Python","url":"https://github.com/bblfsh/python-driver"}`

	diver2 := &bblfshProtocol.DriverImageState{
		Reference: "docker://bblfsh/java-driver",
		Language:  "java",
		Version:   "v.2",
	}
	driver2_exp := `{"id":"java","name":"Java","url":"https://github.com/bblfsh/java-driver"}`

	s := &bblfshProtocolServiceMock{
		DriverStatesFunc: func() ([]*bblfshProtocol.DriverImageState, error) {
			return []*bblfshProtocol.DriverImageState{diver1, diver2}, nil
		},
	}

	w, err := request(&bblfshServiceMock{}, s, "POST", "/api/drivers", strings.NewReader("{}"))
	require.Nil(err)
	require.Equal(http.StatusOK, w.Code)
	require.JSONEq(fmt.Sprintf("[%s,%s]", driver1_exp, driver2_exp), w.Body.String())
}

func TestDriversError(t *testing.T) {
	require := require.New(t)
	s := &bblfshProtocolServiceMock{
		DriverStatesFunc: func() ([]*bblfshProtocol.DriverImageState, error) {
			return nil, fmt.Errorf("No drivers")
		},
	}

	w, err := request(&bblfshServiceMock{}, s, "POST", "/api/drivers", strings.NewReader("{}"))
	require.Nil(err)
	require.Equal(http.StatusBadRequest, w.Code)
}

func TestGetCtlAddr(t *testing.T) {
	require := require.New(t)

	addr, err := server.GetCtlAddr("localhost:8080")
	require.Equal(fmt.Sprintf("localhost:%d", server.DefaultBblfshdCtlPort), addr)
	require.NoError(err)

	addr, err = server.GetCtlAddr("localhost")
	require.Equal("", addr)
	require.Error(err)
}

func TestUcFirst(t *testing.T) {
	require := require.New(t)

	testcases := map[string]string{
		"two words":                    "Two words",
		"two wOrDs with some Upercase": "Two wOrDs with some Upercase",
		"Starts with uppercase":        "Starts with uppercase",
		"one_word":                     "One_word",
		"a":                            "A",
		"B":                            "B",
		"":                             "",
	}

	for input, expected := range testcases {
		require.Equal(expected, server.UcFirst(input), fmt.Sprintf("wrong UcFirst value for '%s'", input))
	}
}

func TestGitHubURLFromDockerReference(t *testing.T) {
	require := require.New(t)

	testcases := map[string]string{
		"docker://company/app:tag": "https://github.com/company/app",
		"docker://company/app":     "https://github.com/company/app",
		"company/app:tag":          "",
		"company/app":              "",
	}

	for input, expected := range testcases {
		value, err := server.GitHubURLFromDockerReference(input)
		require.Equal(expected, value, fmt.Sprintf("wrong github repo for '%s'", input))
		if value == "" {
			require.Error(err, fmt.Sprintf("the github url of '%s' should return an error", input))
		} else {
			require.NoError(err, fmt.Sprintf("the github url of '%s' should not fail", input))
		}
	}
}
