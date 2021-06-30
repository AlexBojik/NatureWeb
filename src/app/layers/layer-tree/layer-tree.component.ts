import {Component, Input, OnInit} from '@angular/core';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource} from '@angular/material/tree';
import {SelectionModel} from '@angular/cdk/collections';
import {Layer, LayersService} from '../layers.service';

@Component({
  selector: 'app-tree-layers',
  templateUrl: './layer-tree.component.html',
  styleUrls: ['./layer-tree.component.scss'],
})
export class LayerTreeComponent implements OnInit {
  @Input() checkbox = true;

  treeControl: NestedTreeControl<Layer>;
  dataSource = new MatTreeNestedDataSource<Layer>();
  checkList = new SelectionModel<Layer>(true);

  isGroup = (node): boolean => node.isGroup;
  hasChild = (_: number, node) => node.isGroup;
  getChildren = (node) => node.layers;

  constructor(private layersSrv: LayersService) {
    this.treeControl = new NestedTreeControl<Layer>(this.getChildren);

    layersSrv.layers$.subscribe(tree => {
      this.dataSource.data = null;
      this.dataSource.data = tree;
    });

    this.checkList.changed.subscribe(changed => {
      for (const layer of changed.added) {
        this.layersSrv.added = layer;
      }
      this.layersSrv.removed = changed.removed;
    });
  }

  ngOnInit(): void {
    this.layersSrv.updateLayers();
  }

  get selected(): Layer {
    return this.layersSrv.selected;
  }

  descendantsAllSelected(node: Layer): boolean {
    return this.treeControl.getDescendants(node).every(child => this.checkList.isSelected(child));
  }

  descendantsPartiallySelected(node: Layer): boolean {
    return this.treeControl.getDescendants(node).some(child => this.checkList.isSelected(child)) && !this.descendantsAllSelected(node);
  }

  groupSelectionToggle(node: Layer): void {
    this.checkList.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checkList.isSelected(node)
      ? this.checkList.select(...descendants)
      : this.checkList.deselect(...descendants);
  }

  layerSelectionToggle(node: Layer): void {
    this.checkList.toggle(node);
  }

  selectLayer(layer: any): void {
    this.layersSrv.selected = layer;
  }
}
