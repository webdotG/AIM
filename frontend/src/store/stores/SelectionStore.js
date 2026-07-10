import { makeAutoObservable } from 'mobx';

export class SelectionStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  selectedNode = null;
  selectedEdge = null;

  selectNode(node) {
    this.selectedNode = node;
  }

  selectEdge(edge) {
    this.selectedEdge = edge;
  }

  clearSelection() {
    this.selectedNode = null;
    this.selectedEdge = null;
  }

  clearNodeSelection() {
    this.selectedNode = null;
  }

  clearEdgeSelection() {
    this.selectedEdge = null;
  }
}