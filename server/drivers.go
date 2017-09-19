package server

type Driver struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	URL  string `json:"url"`
}

var driverList = []Driver{
	{"java", "Java", "https://github.com/bblfsh/java-driver"},
	{"python", "Python", "https://github.com/bblfsh/python-driver"},
}
