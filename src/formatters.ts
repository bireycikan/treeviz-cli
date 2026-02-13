import type { TreeNode } from "./types";

export function generateJsonTree(node: TreeNode): string {
  return JSON.stringify(node, null, 2);
}

export function generateMarkdownTree(
  node: TreeNode,
  indent: number = 0,
  isRoot: boolean = true
): string {
  let result = "";
  const prefix = "  ".repeat(indent);

  if (isRoot) {
    result += `- ${node.name}/\n`;
  }

  const children = node.children ?? [];

  for (const child of children) {
    const suffix = child.type === "directory" ? "/" : "";
    result += `${prefix}- ${child.name}${suffix}\n`;

    if (child.type === "directory" && child.children?.length) {
      result += generateMarkdownTree(child, indent + 1, false);
    }
  }

  return result;
}

export function generateAsciiTree(
  node: TreeNode,
  prefix: string = "",
  isRoot: boolean = true
): string {
  let result = "";

  if (isRoot) {
    result += node.name + "/\n";
  }

  const children = node.children ?? [];

  children.forEach((child, index) => {
    const isLast = index === children.length - 1;
    // Box-drawing: U+251C ├  U+2514 └  U+2500 ─  U+2502 │
    const connector = isLast ? "\u2514\u2500\u2500 " : "\u251C\u2500\u2500 ";
    const childPrefix = isLast ? "    " : "\u2502   ";

    const suffix = child.type === "directory" ? "/" : "";
    result += prefix + connector + child.name + suffix + "\n";

    if (child.type === "directory" && child.children?.length) {
      result += generateAsciiTree(child, prefix + childPrefix, false);
    }
  });

  return result;
}
