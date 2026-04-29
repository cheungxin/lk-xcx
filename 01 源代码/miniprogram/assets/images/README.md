# 图片资源目录

本目录用于存放小程序的图片资源。

## 使用说明

1. 将图片文件放置在此目录下
2. 在页面中使用相对路径引用：`/miniprogram/assets/images/xxx.png`
3. 建议使用 WebP 格式以获得更好的性能

## 图片优化建议

- 使用 WebP 格式（体积更小，质量更好）
- 压缩图片大小（推荐使用 TinyPNG 等工具）
- 大图使用 CDN 加载
- 小图标考虑使用 IconFont 或 SVG

## 示例图片

- `placeholder.png` - 占位图
- `default-avatar.png` - 默认头像
- `logo.png` - 应用 Logo
