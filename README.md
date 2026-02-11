# MCP TortoiseSVN

一个功能完整的 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 服务器，为 Windows 环境提供 TortoiseSVN 和 Subversion 集成支持。

## 功能特性

- **67+ 个工具**：30个命令行 SVN 工具 + 37个 TortoiseSVN GUI 工具
- **完整的 SVN 支持**：覆盖日常开发所需的所有 Subversion 操作
- **双重操作模式**：
  - 命令行模式 (`svn_*`)：静默执行，适合自动化脚本
  - GUI 模式 (`tortoise_*`)：可视化对话框，适合交互式操作
- **类型安全**：使用 Zod 进行严格的 TypeScript 类型校验
- **Windows 原生支持**：完美处理 Windows 路径和 TortoiseSVN 集成

## 系统要求

- **Windows** 操作系统
- **Node.js** 18.0.0 或更高版本
- **TortoiseSVN** 已安装（提供 `svn.exe` 和 `TortoiseProc.exe`）

## 快速开始

### 1. 构建项目

```bash
# 克隆仓库后进入目录
cd mcp-tortoisesvn

# 安装依赖并构建
npm install
```

### 2. 配置 MCP 客户端

#### Claude Desktop / Cline / 通用 MCP 配置

编辑配置文件：

- **Claude Desktop**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Cline**: VS Code Cline 插件设置中的 MCP 配置

添加以下配置（将路径修改为你的实际路径）：

```json
{
  "mcpServers": {
    "tortoisesvn": {
      "command": "node",
      "args": ["C:\\Users\\YourName\\Codes\\mcp-tortoisesvn\\dist\\index.js"]
    }
  }
}
```

#### OpenCode 配置

在 `~/.config/opencode/config.json` 中添加：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "tortoisesvn": {
      "type": "local",
      "command": [
        "node",
        "C:/Users/YourName/Codes/mcp-tortoisesvn/dist/index.js"
      ],
      "enabled": true,
      "timeout": 30000
    }
  }
}
```

### 3. 使用示例

配置完成后，直接在对话中使用自然语言调用：

```
检查当前目录的 SVN 状态
提交更改，消息为"修复登录bug"
查看最近10条提交历史
创建新分支 feature/login-page
```

## 工具分类

### SVN 命令行工具 (30个)

用于静默执行，无需用户交互：

| 类别         | 工具                                                                                                                                            |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **基础操作** | `svn_checkout`, `svn_update`, `svn_commit`, `svn_add`, `svn_delete`, `svn_revert`, `svn_cleanup`                                                |
| **信息查询** | `svn_status`, `svn_log`, `svn_info`, `svn_diff`, `svn_blame`                                                                                    |
| **分支合并** | `svn_copy`, `svn_move`, `svn_merge`, `svn_switch`                                                                                               |
| **锁定管理** | `svn_lock`, `svn_unlock`                                                                                                                        |
| **属性管理** | `svn_propset`, `svn_propget`, `svn_proplist`, `svn_propdel`                                                                                     |
| **高级功能** | `svn_export`, `svn_import`, `svn_relocate`, `svn_changelist_add`, `svn_changelist_remove`, `svn_resolve`, `svn_create_patch`, `svn_apply_patch` |

### TortoiseSVN GUI 工具 (37个)

用于打开 TortoiseSVN 对话框进行可视化操作：

| 类别         | 工具                                                                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **仓库操作** | `tortoise_checkout`, `tortoise_import`, `tortoise_export`, `tortoise_repocreate`, `tortoise_repobrowser`, `tortoise_repostatus`, `tortoise_revisiongraph`                |
| **基础操作** | `tortoise_update`, `tortoise_commit`, `tortoise_add`, `tortoise_revert`, `tortoise_cleanup`, `tortoise_resolve`, `tortoise_remove`, `tortoise_rename`, `tortoise_ignore` |
| **分支合并** | `tortoise_copy`, `tortoise_switch`, `tortoise_merge`, `tortoise_mergeall`, `tortoise_relocate`                                                                           |
| **比较查看** | `tortoise_diff`, `tortoise_showcompare`, `tortoise_blame`, `tortoise_cat`                                                                                                |
| **日志历史** | `tortoise_log`, `tortoise_createpatch`                                                                                                                                   |
| **属性设置** | `tortoise_properties`, `tortoise_settings`, `tortoise_sync`, `tortoise_conflict_editor`                                                                                  |
| **锁定管理** | `tortoise_lock`, `tortoise_unlock`                                                                                                                                       |
| **工具**     | `tortoise_about`, `tortoise_help`, `tortoise_rebuildiconcache`, `tortoise_dropvendor`                                                                                    |

> **注意**：GUI 工具需要 Windows 桌面环境，会弹出 TortoiseSVN 对话框。

## 开发

```bash
# 开发模式（自动重新编译）
npm run dev

# 构建项目
npm run build

# 类型检查
npm run typecheck

# 代码检查
npm run lint

# 自动修复代码风格
npm run lint:fix

# 格式化代码
npm run format
```

## 项目结构

```
src/
├── tools/
│   ├── svn/               # 30个命令行 SVN 工具
│   │   ├── svn-add.ts
│   │   ├── svn-commit.ts
│   │   └── ...
│   └── tortoise/          # 37个 TortoiseSVN GUI 工具
│       ├── tortoise-about.ts
│       ├── tortoise-commit.ts
│       └── ...
├── types/                 # TypeScript 类型定义
├── utils/                 # 工具函数
├── errors/                # 错误类
└── server.ts              # MCP 服务器主文件
```

## 故障排除

### 问题：命令未找到

**解决**：确保 TortoiseSVN 已安装并且 `TortoiseProc.exe` 在系统 PATH 中。

### 问题：GUI 工具不显示对话框

**解决**：GUI 工具需要 Windows 桌面环境。在 WSL 或纯命令行环境中无法使用 GUI 工具。

### 问题：路径错误

**解决**：确保 MCP 配置中的路径使用双反斜杠（`\\`）或正斜杠（`/`）。

## 技术栈

- **TypeScript 5.7** - 类型安全的开发体验
- **MCP SDK** - Model Context Protocol 官方 SDK
- **Zod** - 运行时类型验证
- **ESLint + Prettier** - 代码质量和格式化

## 许可证

MIT License

---

**注意**：本项目需要 Windows 操作系统和 TortoiseSVN 客户端。对于 Linux/macOS 用户，建议使用标准 SVN 命令行工具。
