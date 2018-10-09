package server

import (
	"encoding/json"
	"fmt"
	"io"

	"gopkg.in/bblfsh/sdk.v2/uast/nodes"
	"gopkg.in/bblfsh/sdk.v2/uast/nodes/nodesproto"
)

func readAsFlatTree(r io.Reader) (map[uint64]nodes.Node, error) {
	rawGraph, err := nodesproto.ReadRaw(r)
	if err != nil {
		return nil, err
	}

	out := make(map[uint64]nodes.Node)
	seen := make(map[uint64]bool, len(rawGraph.Nodes))
	for i := rawGraph.Root; i < rawGraph.Last; i++ {
		if _, ok := seen[i]; ok {
			continue
		}
		out[i], err = asNode(i, rawGraph.Nodes, seen, false)
		if err != nil {
			return nil, err
		}
	}

	return out, nil
}

func asNode(id uint64, rns map[uint64]nodesproto.RawNode, seen map[uint64]bool, expand bool) (nodes.Node, error) {
	if id == 0 {
		return nil, nil
	}

	rn, ok := rns[id]
	if !ok {
		return nil, fmt.Errorf("node %v is not defined", id)
	}

	seen[id] = false

	if rn.Kind == nodes.KindObject {
		m := make(nodes.Object, len(rn.Keys))
		for i, k := range rn.Keys {
			nk, err := asNode(k, rns, seen, false)
			if err != nil {
				return nil, err
			}
			sk, ok := nk.(nodes.String)
			if !ok {
				return nil, fmt.Errorf("only string keys are supported")
			}

			v := rn.Values[i]

			if v == 0 {
				m[string(sk)] = nil
				continue
			}

			cn, ok := rns[v]
			if !ok {
				return nil, fmt.Errorf("value node %v is not defined", v)
			}

			if cn.Kind == nodes.KindObject && !expand && sk != "@pos" {
				// wrap ids of object nodes in a special type recognizable by FE
				m[string(sk)] = newChildNode(v)
			} else {
				nv, err := asNode(v, rns, seen, sk == "@pos")
				if err != nil {
					return nil, err
				}
				m[string(sk)] = nv
			}
		}
		return m, nil
	}

	if rn.Kind == nodes.KindArray {
		m := make(nodes.Array, len(rn.Values))
		for i, v := range rn.Values {
			cn, ok := rns[v]
			if !ok {
				return nil, fmt.Errorf("node %v is not defined", v)
			}
			if cn.Kind == nodes.KindObject && !expand {
				m[i] = newChildNode(v)
			} else {
				nv, err := asNode(v, rns, seen, false)
				if err != nil {
					return nil, err
				}
				m[i] = nv
			}
		}
		return m, nil
	}

	return rn.Value, nil
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
