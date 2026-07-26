# Do & Write 部署说明

## 1. 创建 Supabase 项目

1. 在 Supabase 新建项目。
2. 打开 SQL Editor，执行 `supabase/migrations/202607260001_create_tasks.sql`。
3. 在 Authentication → Providers 中启用 Email。
4. 在 Project Settings → API 中复制 Project URL 和 anon public key。

本地创建 `.env.local`：

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 2. 本地验证

```bash
npm install
npm run lint
npm run build
npm run preview
```

## 3. 部署到 Vercel

1. 把仓库导入 Vercel。
2. Framework Preset 选择 Vite（仓库中的 `vercel.json` 已配置构建与 SPA 回退）。
3. 添加以下 Production / Preview 环境变量：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. 点击 Deploy。
5. 把 Vercel 生产域名添加到 Supabase Authentication → URL Configuration：
   - Site URL：生产域名
   - Redirect URLs：生产域名及预览域名规则

## 4. PWA 验收

- 使用 HTTPS 生产域名访问。
- Chrome DevTools → Application 中检查 Manifest 与 Service Worker。
- 在手机浏览器中使用“添加到主屏幕”安装。
- 首次联网打开后，断网重开应能加载应用壳；数据写入仍需联网。
