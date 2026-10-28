// A tela do estudo só existe na instância local do Nathan: o build de produção (a Vercel do Igor)
// fica sem o link e sem a rota. VITE_STUDY_ENABLED=true|false força um ou outro.
const flag = import.meta.env.VITE_STUDY_ENABLED as string | undefined

export const STUDY_ENABLED = flag ? flag === 'true' : import.meta.env.DEV
