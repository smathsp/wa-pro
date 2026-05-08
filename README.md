# 炸鱼观察记录

无畏契约炸鱼遭遇个人记录册 —— 每遇到一个炸鱼哥，截图 + ID + 备注，攒成一个公开曝光页。

## 使用方法

### 本地预览

```bash
python3 -m http.server 8080
# 打开 http://localhost:8080/炸鱼曝光台.html
```

直接双击 HTML 文件也能看（使用内置兜底数据），但 fetch `records.json` 需要通过 HTTP。

### 添加记录

1. 游戏中被炸 → 截图保存到 `images/` 文件夹
2. 打开页面，点右下角 **+** 按钮
3. 填写日期（自动填今天）、炸鱼哥 ID、截图路径、备注
4. 提交后卡片立刻出现（存入浏览器 localStorage，标记「待同步」）
5. 在页面顶部点 **导出 JSON** → 自动复制到剪贴板
6. 粘贴追加到 `records.json` 的数组末尾
7. `git commit` + `git push` → GitHub Pages 自动更新

### 截图路径示例

```
images/smurf-20260509-01.jpg, images/smurf-20260509-02.jpg
```

## 文件结构

```
├── 炸鱼曝光台.html   # 主页面
├── records.json      # 数据文件（手动编辑或通过导出同步）
├── images/           # 截图文件夹
└── README.md
```

## 部署到 GitHub Pages

1. 创建 GitHub 仓库
2. 推送到 `main` 分支
3. Settings → Pages → Source: `main` 分支, `/ (root)` → Save
4. 等待几分钟即可通过 `https://<用户名>.github.io/<仓库名>/炸鱼曝光台.html` 访问
