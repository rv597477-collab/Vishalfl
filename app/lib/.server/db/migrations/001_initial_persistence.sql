PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  google_sub TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  source_type TEXT NOT NULL DEFAULT 'webcontainer' CHECK (source_type IN ('webcontainer', 'github-import', 'gitlab-import', 'template', 'upload')),
  starter_template TEXT,
  root_path TEXT NOT NULL DEFAULT '/home/project',
  latest_snapshot_message_id TEXT,
  latest_summary TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_opened_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_user_slug ON projects(user_id, slug);
CREATE INDEX IF NOT EXISTS idx_projects_user_updated ON projects(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  url_id TEXT NOT NULL,
  title TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  forked_from_chat_id TEXT,
  forked_from_message_id TEXT,
  latest_message_at TEXT,
  latest_snapshot_id TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_chats_project_url_id ON chats(project_id, url_id);
CREATE INDEX IF NOT EXISTS idx_chats_project_updated ON chats(project_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chats_user_updated ON chats(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chats_status ON chats(status);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'tool')),
  sequence_no INTEGER NOT NULL,
  content_text TEXT NOT NULL DEFAULT '',
  parts_json TEXT,
  annotations_json TEXT,
  model_name TEXT,
  provider_name TEXT,
  prompt_id TEXT,
  chat_mode TEXT CHECK (chat_mode IN ('build', 'discuss')),
  hidden INTEGER NOT NULL DEFAULT 0 CHECK (hidden IN (0, 1)),
  no_store INTEGER NOT NULL DEFAULT 0 CHECK (no_store IN (0, 1)),
  token_usage_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_id) REFERENCES chats(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_chat_sequence ON messages(chat_id, sequence_no);
CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON messages(chat_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_project_created ON messages(project_id, created_at DESC);

CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  parent_file_id TEXT,
  path TEXT NOT NULL,
  name TEXT NOT NULL,
  node_type TEXT NOT NULL CHECK (node_type IN ('file', 'folder')),
  mime_type TEXT,
  extension TEXT,
  is_binary INTEGER NOT NULL DEFAULT 0 CHECK (is_binary IN (0, 1)),
  content_text TEXT,
  content_blob_ref TEXT,
  content_sha256 TEXT,
  size_bytes INTEGER NOT NULL DEFAULT 0,
  is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
  deleted_at TEXT,
  last_modified_by_message_id TEXT,
  last_modified_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (parent_file_id) REFERENCES files(id),
  FOREIGN KEY (last_modified_by_message_id) REFERENCES messages(id),
  UNIQUE(project_id, path)
);

CREATE INDEX IF NOT EXISTS idx_files_project_path ON files(project_id, path);
CREATE INDEX IF NOT EXISTS idx_files_project_parent ON files(project_id, parent_file_id);
CREATE INDEX IF NOT EXISTS idx_files_project_type_deleted ON files(project_id, node_type, is_deleted);
CREATE INDEX IF NOT EXISTS idx_files_content_sha ON files(content_sha256);

CREATE TABLE IF NOT EXISTS file_versions (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  chat_id TEXT,
  message_id TEXT,
  version_no INTEGER NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('create', 'update', 'delete', 'restore', 'snapshot')),
  content_text TEXT,
  content_blob_ref TEXT,
  content_sha256 TEXT,
  size_bytes INTEGER NOT NULL DEFAULT 0,
  diff_json TEXT,
  created_by_user_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (file_id) REFERENCES files(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (chat_id) REFERENCES chats(id),
  FOREIGN KEY (message_id) REFERENCES messages(id),
  FOREIGN KEY (created_by_user_id) REFERENCES users(id),
  UNIQUE(file_id, version_no)
);

CREATE INDEX IF NOT EXISTS idx_file_versions_file_created ON file_versions(file_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_file_versions_project_created ON file_versions(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_file_versions_chat_message ON file_versions(chat_id, message_id);

CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT,
  chat_id TEXT,
  message_id TEXT,
  file_id TEXT,
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warning', 'error')),
  summary TEXT NOT NULL,
  details_json TEXT,
  source TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (chat_id) REFERENCES chats(id),
  FOREIGN KEY (message_id) REFERENCES messages(id),
  FOREIGN KEY (file_id) REFERENCES files(id)
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created ON activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_project_created ON activity_logs(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_chat_created ON activity_logs(chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_category_action ON activity_logs(category, action);

CREATE TABLE IF NOT EXISTS provider_settings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT,
  provider_name TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  settings_json TEXT NOT NULL DEFAULT '{}',
  selected_model TEXT,
  is_default_provider INTEGER NOT NULL DEFAULT 0 CHECK (is_default_provider IN (0, 1)),
  scope TEXT NOT NULL CHECK (scope IN ('user', 'project')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_provider_settings_scope ON provider_settings(
  user_id,
  COALESCE(project_id, ''),
  provider_name,
  scope
);
CREATE INDEX IF NOT EXISTS idx_provider_settings_user_project ON provider_settings(user_id, project_id);

CREATE TABLE IF NOT EXISTS integration_connections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT,
  provider TEXT NOT NULL CHECK (provider IN ('github', 'gitlab', 'supabase', 'vercel', 'netlify')),
  account_identifier TEXT,
  display_name TEXT,
  status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error')),
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TEXT,
  config_json TEXT NOT NULL DEFAULT '{}',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_validated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_integration_connections_scope ON integration_connections(
  user_id,
  COALESCE(project_id, ''),
  provider
);
CREATE INDEX IF NOT EXISTS idx_integration_connections_provider_status ON integration_connections(provider, status);

CREATE TABLE IF NOT EXISTS file_locks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  chat_id TEXT,
  file_id TEXT,
  path TEXT NOT NULL,
  lock_type TEXT NOT NULL CHECK (lock_type IN ('file', 'folder')),
  reason TEXT,
  locked_by_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT,
  released_at TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (chat_id) REFERENCES chats(id),
  FOREIGN KEY (file_id) REFERENCES files(id),
  FOREIGN KEY (locked_by_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_file_locks_project_active ON file_locks(project_id, released_at, expires_at);
CREATE INDEX IF NOT EXISTS idx_file_locks_chat_active ON file_locks(chat_id, released_at);
CREATE INDEX IF NOT EXISTS idx_file_locks_file_active ON file_locks(file_id, released_at);
