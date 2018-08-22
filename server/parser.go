package server

import (
	"encoding/binary"
	"encoding/json"
	"fmt"
	"io"
	"sort"

	"gopkg.in/bblfsh/sdk.v2/uast/nodes"
	"gopkg.in/bblfsh/sdk.v2/uast/nodes/nodesproto"
	"gopkg.in/bblfsh/sdk.v2/uast/nodes/nodesproto/pio"
)

const (
	magic   = "\x00bgr"
	version = 0x1
)

const (
	keysDiff   = false
	valsOffs   = true
	dedupNodes = true
)

const stats = true

var (
	MapSize   int
	ArrSize   int
	ValSize   int
	DelimSize int

	KeysCnt     int
	KeysFromCnt int
	DupsCnt     int
)

func newGraphReader() *graphReader {
	return &graphReader{}
}

type graphReader struct {
	nodes    map[uint64]*nodesproto.Node
	detached []uint64
	root     uint64
	meta     uint64
	last     uint64
}

func (g *graphReader) readHeader(r io.Reader) error {
	var b [8]byte
	n, err := r.Read(b[:])
	if err == io.EOF {
		return io.ErrUnexpectedEOF
	} else if err != nil {
		return err
	} else if n != len(b) {
		return fmt.Errorf("short read")
	}
	if string(b[:4]) != magic {
		return fmt.Errorf("not a graph file")
	}
	vers := binary.LittleEndian.Uint32(b[4:])
	if vers != version {
		return fmt.Errorf("unsupported version: %x", vers)
	}
	return nil
}

func (g *graphReader) readGraph(r io.Reader) error {
	if err := g.readHeader(r); err != nil {
		return err
	}
	pr := pio.NewReader(r, 10*1024*1024)
	var gh nodesproto.GraphHeader
	if err := pr.ReadMsg(&gh); err != nil {
		return err
	}
	g.last, g.root, g.meta = gh.LastId, gh.Root, gh.Metadata
	var (
		prevID uint64
		nodes  = make(map[uint64]*nodesproto.Node)
	)
	for {
		nd := &nodesproto.Node{}
		if err := pr.ReadMsg(nd); err == io.EOF {
			break
		} else if err != nil {
			return err
		}

		if nd.Id == 0 {
			// allow to omit ID
			nd.Id = prevID + 1
		} else if prevID >= nd.Id {
			// but IDs should be ascending
			return fmt.Errorf("node IDs should be ascending")
		}
		prevID = nd.Id
		// there should be no duplicates
		if _, ok := nodes[nd.Id]; ok {
			return fmt.Errorf("duplicate node with id %d", nd.Id)
		}
		// support KeysFrom
		if nd.KeysFrom != 0 {
			n2, ok := nodes[nd.KeysFrom]
			if !ok {
				return fmt.Errorf("KeysFrom refers to an undefined node %d", nd.KeysFrom)
			}
			nd.Keys = n2.Keys
		} else if keysDiff && len(nd.Keys) > 1 {
			cur := nd.Keys[0]
			for i := 1; i < len(nd.Keys); i++ {
				v := nd.Keys[i]
				v += cur
				nd.Keys[i] = v
				cur = v
			}
		}
		// support ValuesOffs
		if nd.ValuesOffs != 0 {
			for i := range nd.Values {
				nd.Values[i] += nd.ValuesOffs
			}
		}

		nodes[nd.Id] = nd
	}
	refs := make(map[uint64]struct{}, len(nodes))
	roots := make(map[uint64]struct{})
	use := func(id uint64) {
		refs[id] = struct{}{}
		delete(roots, id)
	}

	for _, n := range nodes {
		for _, id := range n.Keys {
			use(id)
		}
		for _, id := range n.Values {
			use(id)
		}
		if _, ok := refs[n.Id]; !ok {
			roots[n.Id] = struct{}{}
		}
	}
	arr := make([]uint64, 0, len(roots))
	for id := range roots {
		arr = append(arr, id)
	}
	sort.Slice(arr, func(i, j int) bool {
		return arr[i] < arr[j]
	})
	g.nodes = nodes
	g.detached = arr
	// root is optional - detect automatically if not set
	if g.root == 0 && len(g.detached) != 0 {
		if len(g.detached) == 1 {
			g.root = g.detached[0]
		} else {
			g.last++
			id := g.last
			g.nodes[id] = &nodesproto.Node{Id: id, Values: g.detached}
		}
	}
	return nil
}

func (g *graphReader) asFlatTree() (map[uint64]nodes.Node, error) {
	if g.root == 0 {
		return nil, nil
	}
	seen := make(map[uint64]bool, len(g.nodes))
	out := make(map[uint64]nodes.Node)
	var err error
	for i := g.root; i < g.last; i++ {
		if _, ok := seen[i]; ok {
			continue
		}
		out[i], err = g.asNode(i, seen, false)
		if err != nil {
			return nil, err
		}
	}
	return out, nil
}

func (g *graphReader) asNode(id uint64, seen map[uint64]bool, expand bool) (nodes.Node, error) {
	if id == 0 {
		return nil, nil
	}
	n, ok := g.nodes[id]
	if !ok {
		return nil, fmt.Errorf("node %v is not defined", id)
	}
	if n.Value == nil {
		// loops are not allowed
		if leaf, ok := seen[id]; ok && !leaf {
			return nil, fmt.Errorf("not a tree: %d", id)
		}
	}
	isLeaf := func() bool {
		for _, sid := range n.Keys {
			if sid == 0 {
				continue
			}
			if l, ok := seen[sid]; ok {
				if l {
					continue
				}
				return false
			}
			if g.nodes[sid].Value == nil {
				return false
			}
		}
		for _, sid := range n.Values {
			if sid == 0 {
				continue
			}
			if l, ok := seen[sid]; ok {
				if l {
					continue
				}
				return false
			}
			if g.nodes[sid].Value == nil {
				return false
			}
		}
		return true
	}
	leaf := n.Value != nil
	if !leaf {
		leaf = isLeaf()
	}
	seen[id] = leaf
	if n.Value != nil {
		switch n := n.Value.(type) {
		case *nodesproto.Node_String_:
			return nodes.String(n.String_), nil
		case *nodesproto.Node_Int:
			return nodes.Int(n.Int), nil
		case *nodesproto.Node_Uint:
			return nodes.Uint(n.Uint), nil
		case *nodesproto.Node_Bool:
			return nodes.Bool(n.Bool), nil
		case *nodesproto.Node_Float:
			return nodes.Float(n.Float), nil
		}
		return nil, fmt.Errorf("unsupported node type: %T", n.Value)
	}
	var out nodes.Node
	if len(n.Keys) != 0 || n.IsObject {
		if len(n.Keys) != len(n.Values) {
			return nil, fmt.Errorf("number of keys doesn't match a number of values: %d vs %d", len(n.Keys), len(n.Values))
		}
		m := make(nodes.Object, len(n.Keys))
		for i, k := range n.Keys {
			nk, err := g.asNode(k, seen, false)
			if err != nil {
				return nil, err
			}
			sk, ok := nk.(nodes.String)
			if !ok {
				return nil, fmt.Errorf("only string keys are supported")
			}
			v := n.Values[i]

			cn, ok := g.nodes[v]
			// FIXME(max): it's ugly
			if !expand && sk != "@pos" && ok && (len(cn.Keys) != 0 || cn.IsObject) {
				m[string(sk)] = newChildNode(v)
			} else {
				nv, err := g.asNode(v, seen, sk == "@pos")
				if err != nil {
					return nil, err
				}
				m[string(sk)] = nv
			}
		}
		out = m
	} else {
		m := make(nodes.Array, 0, len(n.Values))
		for _, v := range n.Values {
			cn, ok := g.nodes[v]
			if !ok {
				return nil, fmt.Errorf("node %v is not defined", v)
			}
			if len(cn.Keys) != 0 || cn.IsObject {
				m = append(m, newChildNode(v))
			} else {
				nv, err := g.asNode(v, seen, false)
				if err != nil {
					return nil, err
				}
				m = append(m, nv)
			}
		}
		out = m
	}
	if !leaf && isLeaf() {
		seen[id] = true
	}
	return out, nil
}

// need to wrap into struct instead of type alias to make methods work
type childNode struct {
	nodes.Uint
}

func newChildNode(v uint64) *childNode {
	return &childNode{Uint: nodes.Uint(v)}
}

func (n *childNode) MarshalJSON() ([]byte, error) {
	return json.Marshal(struct {
		ID   uint64 `json:"id"`
		Type string `json:"_uast_node_type"`
	}{
		ID:   uint64(n.Uint),
		Type: "child",
	})
}
