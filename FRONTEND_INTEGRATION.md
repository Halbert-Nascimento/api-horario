# Guia de Integração Frontend - Sistema de Autenticação

Este documento explica como integrar o sistema de autenticação da API no frontend.

## 📋 Visão Geral

O sistema de autenticação utiliza JWT (JSON Web Tokens) para autenticar usuários. O fluxo básico é:

1. **Login**: Enviar credenciais → Receber token JWT
2. **Armazenar**: Salvar token no navegador (localStorage/sessionStorage)
3. **Usar**: Incluir token em todas requisições protegidas
4. **Renovar**: Fazer novo login quando token expirar (1 hora)

## 🔐 Perfis Disponíveis

A API possui 3 perfis (roles) na seguinte ordem:

| ID | Nome do Perfil | Descrição |
|----|----------------|-----------|
| 1  | Professor      | Acesso para professores |
| 2  | Coordenador    | Acesso para coordenadores |
| 3  | Admin          | Acesso administrativo total |

## 🚀 Endpoints da API

### Base URL
```
http://localhost:3001
```
(Ajuste conforme seu ambiente: desenvolvimento, staging ou produção)

## 📡 1. Login (Autenticação)

### Endpoint
```
POST /auth/login
```

### Headers
```http
Content-Type: application/json
```

### Request Body
```json
{
  "email": "usuario@exemplo.com",
  "senha": "senha123"
}
```

### Response Success (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@exemplo.com",
    "nome": "João Silva",
    "perfil": "Professor",
    "perfil_id": 1
  }
}
```

### Response Error (401 Unauthorized)
```json
{
  "message": "Credenciais inválidas"
}
```

### Response Error (400 Bad Request)
```json
{
  "message": "Email e senha são obrigatórios"
}
```

## 📝 2. Registro de Usuário

### Endpoint
```
POST /register
```

### Headers
```http
Content-Type: application/json
```

### Request Body
```json
{
  "nomeUsuario": "João Silva",
  "emailUsuario": "joao@exemplo.com",
  "senha": "senha123",
  "idPerfil": 1
}
```

### Response Success (201 Created)
```json
{
  "message": "Usuário registrado com sucesso",
  "data": {
    "idUsuario": 1,
    "nomeUsuario": "João Silva",
    "emailUsuario": "joao@exemplo.com",
    "idPerfil": 1
  }
}
```

### Response Error (400 Bad Request)
```json
{
  "message": "Email já cadastrado"
}
```

OU com validações:

```json
{
  "errors": [
    {
      "msg": "Email inválido",
      "param": "emailUsuario",
      "location": "body"
    },
    {
      "msg": "Senha deve ter no mínimo 6 caracteres",
      "param": "senha",
      "location": "body"
    }
  ]
}
```

## 🔒 3. Acessando Rotas Protegidas

### Headers Obrigatórios
```http
Content-Type: application/json
Authorization: ******
```

### Exemplo: Listar Usuários
```
GET /usuario
```

### Response Success (200 OK)
```json
[
  {
    "idUsuario": 1,
    "nomeUsuario": "João Silva",
    "emailUsuario": "joao@exemplo.com",
    "idPerfil": 1,
    "ativo": 1
  }
]
```

### Response Error (401 Unauthorized)
```json
{
  "message": "Token não fornecido"
}
```

OU

```json
{
  "message": "Token inválido"
}
```

OU

```json
{
  "message": "Token expirado"
}
```

## 💻 Implementação no Frontend

### 1. Vanilla JavaScript

#### Login
```javascript
async function login(email, senha) {
  try {
    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();

    if (response.ok) {
      // Salvar token no localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('Login realizado com sucesso!');
      console.log('Usuário:', data.user);
      
      // Redirecionar para página principal
      window.location.href = '/dashboard';
    } else {
      // Exibir erro
      alert(data.message);
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    alert('Erro ao conectar com o servidor');
  }
}

// Uso
login('usuario@exemplo.com', 'senha123');
```

#### Fazer Requisição Autenticada
```javascript
async function listarUsuarios() {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Você precisa estar logado');
      window.location.href = '/login';
      return;
    }

    const response = await fetch('http://localhost:3001/usuario', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      // Token expirado ou inválido
      alert('Sessão expirada. Faça login novamente.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }

    const usuarios = await response.json();
    console.log('Usuários:', usuarios);
    
    return usuarios;
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
  }
}
```

#### Logout
```javascript
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}
```

#### Verificar se Está Logado
```javascript
function isAuthenticated() {
  return localStorage.getItem('token') !== null;
}

function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/login';
  }
}

// Usar em páginas protegidas
requireAuth();
```

#### Obter Dados do Usuário Logado
```javascript
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

function getUserRole() {
  const user = getCurrentUser();
  return user ? user.perfil : null;
}

function getUserRoleId() {
  const user = getCurrentUser();
  return user ? user.perfil_id : null;
}

// Exemplos de uso
const user = getCurrentUser();
console.log('Usuário logado:', user.nome);
console.log('Perfil:', user.perfil);

if (user.perfil === 'Admin') {
  console.log('Usuário é administrador');
}
```

### 2. React

#### Serviço de API (api.js)
```javascript
// src/services/api.js
const API_URL = 'http://localhost:3001';

export const api = {
  // Login
  async login(email, senha) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, senha })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  },

  // Requisição autenticada genérica
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      }
    });

    if (response.status === 401) {
      // Token expirado - fazer logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Sessão expirada');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  },

  // Listar usuários
  async getUsuarios() {
    return this.request('/usuario');
  },

  // Criar usuário
  async createUsuario(data) {
    return this.request('/usuario', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
```

#### Context de Autenticação (AuthContext.jsx)
```javascript
// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    
    setLoading(false);
  }, []);

  const login = async (email, senha) => {
    const data = await api.login(email, senha);
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    setUser(data.user);
    
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const hasRole = (roles) => {
    if (!user) return false;
    
    // roles pode ser string ou array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    return allowedRoles.includes(user.perfil) || 
           allowedRoles.includes(user.perfil_id);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
```

#### Componente de Login (Login.jsx)
```javascript
// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, senha);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label>Senha:</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        {error && <div style={{ color: 'red' }}>{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
```

#### Rota Protegida (PrivateRoute.jsx)
```javascript
// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PrivateRoute({ children, roles }) {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !hasRole(roles)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return children;
}
```

#### App.jsx
```javascript
// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AdminPanel } from './pages/AdminPanel';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          
          <Route path="/admin" element={
            <PrivateRoute roles={['Admin', 3]}>
              <AdminPanel />
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

### 3. Vue.js

#### Serviço de API (api.js)
```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001'
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erro 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### Store Vuex (auth.js)
```javascript
// src/store/modules/auth.js
import api from '@/services/api';

export default {
  namespaced: true,
  
  state: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null
  },
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    user: (state) => state.user,
    userRole: (state) => state.user?.perfil,
    userRoleId: (state) => state.user?.perfil_id
  },
  
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    SET_TOKEN(state, token) {
      state.token = token;
    },
    CLEAR_AUTH(state) {
      state.user = null;
      state.token = null;
    }
  },
  
  actions: {
    async login({ commit }, { email, senha }) {
      const { data } = await api.post('/auth/login', { email, senha });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      commit('SET_TOKEN', data.token);
      commit('SET_USER', data.user);
      
      return data.user;
    },
    
    logout({ commit }) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      commit('CLEAR_AUTH');
    }
  }
};
```

## 🛡️ Controle de Acesso por Perfil

### Verificar Perfil no Frontend

#### JavaScript
```javascript
function canAccess(allowedRoles) {
  const user = getCurrentUser();
  if (!user) return false;
  
  return allowedRoles.includes(user.perfil) || 
         allowedRoles.includes(user.perfil_id);
}

// Exemplos
if (canAccess(['Admin', 3])) {
  // Mostrar botão de administração
}

if (canAccess([1, 2])) {
  // Professor ou Coordenador
}
```

#### React
```javascript
// Usando o hook useAuth
const { hasRole } = useAuth();

{hasRole('Admin') && (
  <button>Painel Admin</button>
)}

{hasRole([1, 2]) && (
  <div>Conteúdo para Professor ou Coordenador</div>
)}
```

## ⚠️ Boas Práticas

### 1. Segurança
- ✅ **NUNCA** armazene a senha no frontend
- ✅ Use HTTPS em produção
- ✅ Limpe token ao fazer logout
- ✅ Redirecione para login quando token expirar
- ✅ Valide permissões no backend também (não confie apenas no frontend)

### 2. Experiência do Usuário
- ✅ Mostre feedback de loading durante autenticação
- ✅ Exiba mensagens de erro claras
- ✅ Redirecione automaticamente após login
- ✅ Mantenha usuário logado (se desejar) usando localStorage
- ✅ Implemente logout automático após inatividade (opcional)

### 3. Tratamento de Erros
```javascript
try {
  await api.login(email, senha);
} catch (error) {
  if (error.message === 'Credenciais inválidas') {
    alert('Email ou senha incorretos');
  } else if (error.message === 'Sessão expirada') {
    alert('Sua sessão expirou. Faça login novamente.');
  } else {
    alert('Erro ao conectar com o servidor');
  }
}
```

## 🔄 Renovação de Token

O token JWT expira em **1 hora**. Para renovar:

### Opção 1: Novo Login
```javascript
// Quando token expirar (401), redirecionar para login
if (response.status === 401) {
  logout();
  window.location.href = '/login';
}
```

### Opção 2: Refresh Token (Implementação Futura)
- Backend precisa implementar endpoint de refresh
- Frontend armazena refresh token
- Solicita novo access token quando expirar

## 📋 Checklist de Integração

- [ ] Configurar base URL da API
- [ ] Implementar função de login
- [ ] Armazenar token após login
- [ ] Adicionar token em headers das requisições
- [ ] Tratar erro 401 (token expirado)
- [ ] Implementar logout
- [ ] Proteger rotas/páginas que requerem autenticação
- [ ] Implementar controle de acesso por perfil
- [ ] Testar fluxo completo de autenticação
- [ ] Testar expiração de token
- [ ] Adicionar feedback visual (loading, erros)

## 🧪 Teste Manual

1. **Login com credenciais válidas** → Deve retornar token e dados do usuário
2. **Login com credenciais inválidas** → Deve retornar erro 401
3. **Acessar rota protegida sem token** → Deve retornar erro 401
4. **Acessar rota protegida com token** → Deve retornar dados
5. **Esperar 1 hora e fazer requisição** → Deve retornar erro de token expirado
6. **Logout** → Deve limpar token e redirecionar

## 💡 Exemplo Completo de Página HTML

```html
<!DOCTYPE html>
<html>
<head>
  <title>Login</title>
</head>
<body>
  <div id="login-form">
    <h2>Login</h2>
    <input type="email" id="email" placeholder="Email">
    <input type="password" id="senha" placeholder="Senha">
    <button onclick="fazerLogin()">Entrar</button>
    <p id="error" style="color: red;"></p>
  </div>

  <div id="dashboard" style="display: none;">
    <h2>Dashboard</h2>
    <p>Bem-vindo, <span id="userName"></span>!</p>
    <p>Perfil: <span id="userRole"></span></p>
    <button onclick="fazerLogout()">Sair</button>
    <button onclick="listarUsuarios()">Listar Usuários</button>
    <div id="usuarios"></div>
  </div>

  <script>
    const API_URL = 'http://localhost:3001';

    // Verificar se já está logado
    window.onload = function() {
      const token = localStorage.getItem('token');
      if (token) {
        mostrarDashboard();
      }
    };

    async function fazerLogin() {
      const email = document.getElementById('email').value;
      const senha = document.getElementById('senha').value;
      const errorEl = document.getElementById('error');

      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          mostrarDashboard();
        } else {
          errorEl.textContent = data.message;
        }
      } catch (error) {
        errorEl.textContent = 'Erro ao conectar com servidor';
      }
    }

    function mostrarDashboard() {
      const user = JSON.parse(localStorage.getItem('user'));
      document.getElementById('login-form').style.display = 'none';
      document.getElementById('dashboard').style.display = 'block';
      document.getElementById('userName').textContent = user.nome;
      document.getElementById('userRole').textContent = user.perfil;
    }

    function fazerLogout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.getElementById('login-form').style.display = 'block';
      document.getElementById('dashboard').style.display = 'none';
      document.getElementById('email').value = '';
      document.getElementById('senha').value = '';
    }

    async function listarUsuarios() {
      const token = localStorage.getItem('token');
      
      try {
        const response = await fetch(`${API_URL}/usuario`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          alert('Sessão expirada');
          fazerLogout();
          return;
        }

        const usuarios = await response.json();
        document.getElementById('usuarios').innerHTML = 
          '<pre>' + JSON.stringify(usuarios, null, 2) + '</pre>';
      } catch (error) {
        alert('Erro ao listar usuários');
      }
    }
  </script>
</body>
</html>
```

## 📞 Suporte

Se tiver dúvidas ou problemas:
1. Verifique a documentação da API em `AUTHENTICATION.md`
2. Verifique se o servidor está rodando
3. Verifique se as credenciais estão corretas
4. Verifique o console do navegador para erros
5. Verifique se o token está sendo enviado corretamente

## 🎯 Resumo

- Login retorna **token** e **dados do usuário**
- Token deve ser incluído no header **Authorization: ******
- Token expira em **1 hora**
- Perfis disponíveis: **Professor (1)**, **Coordenador (2)**, **Admin (3)**
- Sempre tratar erro **401** (não autorizado)
- Armazenar token no **localStorage** ou **sessionStorage**
