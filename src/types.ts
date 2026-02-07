export interface TreeNode {
  name: string;
  type: "file" | "directory";
  children?: TreeNode[];
}
