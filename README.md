# 炸鱼记录

无畏契约炸鱼遭遇个人记录册。遇到炸鱼哥，截图 + ID + 备注，攒成一个公开曝光页。

## 技术栈

单文件 Vue 3 SPA（CDN 引入），战术黑暗主题，GitHub API 持久化，PicList-Core 上传图床。

## 本地预览

```bash
python3 -m http.server 8080
# 打开 http://localhost:8080
```

直接双击 `index.html` 也能看（使用内置兜底数据），但 fetch `records.json` 需要通过 HTTP。

## 添加记录

1. 游戏中被炸 → 截图保存
2. 打开页面，点右下角 **+** 按钮
3. 填写日期（自动填今天）、炸鱼哥 ID、备注
4. 有截图的话，通过 PicList-Core 本地上传（需先在设置中配置），或手动粘贴 URL
5. 点击 **提交到 GitHub** → 自动写入仓库的 `records.json`
6. 表单内容自动保存到浏览器，误关弹窗不会丢失

## 设置

点右上角齿轮进入设置页：

| 服务 | 必填项 | 说明 |
|---|---|---|
| GitHub | 用户名、仓库名、分支、Token | Token 需勾选 Contents 读写权限 |
| PicList-Core | 服务地址、图床名称、密钥 | 上传截图到图床，返回 URL 自动填入表单 |

设置保存在浏览器 localStorage，Token 不会离开本地。

## 数据格式

`records.json` 为数组，每条记录：

```json
{
  "date": "2026-05-08",
  "id": "暴力男人#94771",
  "images": ["https://img.smathsp.com/2026/05/xxx.webp"],
  "note": "2级小号炸鱼哥"
}
```

## 文件结构

```
├── index.html      # 主页面（Vue 3 + 全部 CSS/JS）
├── records.json    # 数据文件（通过 GitHub API 读写）
├── images/         # 截图文件夹（可选，推荐用图床）
└── README.md
```

## 部署

项目部署在 [Vercel](https://wa-pro-sable.vercel.app)。

也可部署到 GitHub Pages：

1. 推送到 GitHub 仓库 `main` 分支
2. Settings → Pages → Source: `main` 分支, `/ (root)` → Save
3. 通过 `https://<用户名>.github.io/<仓库名>` 访问
