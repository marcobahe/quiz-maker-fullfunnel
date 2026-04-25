# Google OAuth - QuizMeBaby

## Redirect URIs configurados no Google Cloud Console

Para que o login com Google funcione, os seguintes redirect URIs precisam estar
autorizados na credencial OAuth 2.0:

- `https://quizmebaby.app/api/auth/callback/google`
- `https://www.quizmebaby.app/api/auth/callback/google`
- `https://quiz-maker-fullfunnel.vercel.app/api/auth/callback/google`

## Como verificar

1. Acesse https://console.cloud.google.com/apis/credentials
2. Selecione o projeto com o client ID `1083342020042-97pbfve0c3t6t0ilb0eottmr0lpqp3q2.apps.googleusercontent.com`
3. Edite a credencial OAuth 2.0
4. Em "Authorized redirect URIs", adicione os URIs acima
5. Salve

## Erro característico quando falta redirect URI

O endpoint `/api/auth/signin/google` retorna 302 para `/login?error=google`
(ou o Google retorna `redirect_uri_mismatch` diretamente).

## Diagnóstico rápido

```bash
curl -s -D - "https://accounts.google.com/o/oauth2/v2/auth?\
  client_id=1083342020042-97pbfve0c3t6t0ilb0eottmr0lpqp3q2.apps.googleusercontent.com&\
  redirect_uri=https%3A%2F%2Fquizmebaby.app%2Fapi%2Fauth%2Fcallback%2Fgoogle&\
  response_type=code&scope=openid%20email%20profile"
```

Se retornar redirect para `accounts.google.com/signin/oauth/error`,
o redirect URI ainda nao esta autorizado.
