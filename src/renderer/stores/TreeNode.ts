import { ITreeNode, IconName } from "@blueprintjs/core";
import { observable, action, IObservableArray } from "mobx";
import ItBlockWithStatus, { SnapshotErrorStatus } from "../types/it-block";
import TreeNodeType from "../types/node-type";
import {
  TestReconcilationState,
  parse as babylonParse
} from "jest-editor-support";
import { readFile } from "fs";
import CoverageSummary from "./CoverageSummary";
import { FileExecutingIcon } from "../constants/ui";
import { Icons } from "../util/constants";

class TreeNode implements ITreeNode {
  @observable childNodes?: ITreeNode[];
  @observable hasCaret?: boolean;
  @observable iconName?: IconName;
  @observable id: string | number;
  @observable isExpanded?: boolean;
  @observable isSelected?: boolean = false;
  @observable label: string | JSX.Element;
  @observable secondaryLabel?: string | JSX.Element = "";
  @observable className?: string;
  @observable path: string;
  @observable status: TestReconcilationState;
  @observable output: string;
  @observable itBlocks: IObservableArray<ItBlockWithStatus> = observable([]);
  @observable type: TreeNodeType;
  @observable isTest: boolean;
  @observable content: string;
  @observable coverage = new CoverageSummary();

  @action
  setToFileIcon() {
    this.secondaryLabel = "";
    this.iconName = Icons.FileIcon;
    this.className = "";
  }

  @action
  spin() {
    this.className = "spin";
    this.iconName = FileExecutingIcon;
  }

  @action
  toggleAllTests() {
    this.itBlocks.forEach(it => {
      it.isExecuting = true;
      it.snapshotErrorStatus = "";
    });
  }

  @action
  highlight() {
    this.isSelected = true;
  }

  @action
  readContent() {
    readFile(this.path, (err, data) => {
      this.content = data.toString();
    });
  }

  @action
  parseItBlocks(shouldExecute) {
    let itBlocks: ItBlockWithStatus[] = [];

    if (this.type === "file" && this.isTest) {
      itBlocks = babylonParse(this.path).itBlocks.map(block =>
        observable({
          ...block,
          status: "" as TestReconcilationState,
          assertionMessage: "",
          isExecuting: shouldExecute,
          snapshotErrorStatus: "unknown" as SnapshotErrorStatus,
          updatingSnapshot: false
        })
      );
    }

    this.itBlocks.clear();
    this.itBlocks.push(...itBlocks);
  }
}

export default TreeNode;
