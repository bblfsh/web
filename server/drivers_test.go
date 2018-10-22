package server_test

import (
	"fmt"
	"net/http"
	"strings"
	"testing"

	"github.com/stretchr/testify/require"
	"gopkg.in/bblfsh/sdk.v1/protocol"
)

func TestDriversSuccess(t *testing.T) {
	require := require.New(t)

	driver1 := protocol.DriverManifest{
		Name:     "Python",
		Language: "python",
		Version:  "v.1",
	}
	driver1_exp := `{"id":"python","name":"Python","url":"https://github.com/bblfsh/python-driver"}`

	driver2 := protocol.DriverManifest{
		Name:     "Java",
		Language: "java",
		Version:  "v.2",
	}
	driver2_exp := `{"id":"java","name":"Java","url":"https://github.com/bblfsh/java-driver"}`

	s := &bblfshServiceMock{
		SupportedLanguagesFunc: func(*protocol.SupportedLanguagesRequest) *protocol.SupportedLanguagesResponse {
			return &protocol.SupportedLanguagesResponse{
				Languages: []protocol.DriverManifest{driver1, driver2},
			}
		},
	}

	w, err := requestV1(s, "POST", "/api/drivers", strings.NewReader("{}"))
	require.Nil(err)
	require.Equal(http.StatusOK, w.Code)
	require.JSONEq(fmt.Sprintf("[%s,%s]", driver1_exp, driver2_exp), w.Body.String())
}

func TestDriversError(t *testing.T) {
	require := require.New(t)
	s := &bblfshServiceMock{
		SupportedLanguagesFunc: func(*protocol.SupportedLanguagesRequest) *protocol.SupportedLanguagesResponse {
			return &protocol.SupportedLanguagesResponse{
				Response: protocol.Response{
					Status: protocol.Fatal,
					Errors: []string{"error"},
				},
			}
		},
	}

	w, err := requestV1(s, "POST", "/api/drivers", strings.NewReader("{}"))
	require.Nil(err)
	require.Equal(http.StatusInternalServerError, w.Code)
}
