"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"
import { registerUser } from "./actions"
import { toast } from "sonner"
import Link from "next/link"

export default function LoginPage() {
    const router = useRouter()
    const [isLogin, setIsLogin] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    // Form states
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        })

        if (result?.error) {
            toast.error("E-mail ou senha incorretos")
            setLoading(false)
        } else {
            toast.success("Login realizado com sucesso!")
            router.push("/")
            router.refresh()
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData()
        formData.append("name", name)
        formData.append("email", email)
        formData.append("password", password)

        const result = await registerUser(formData)

        if (result.error) {
            toast.error(result.error)
            setLoading(false)
        } else {
            setSuccess(true)
            toast.success("Conta criada com sucesso!")
            setTimeout(() => {
                setIsLogin(true)
                setSuccess(false)
                setLoading(false)
            }, 2000)
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-background">
            {/* Background elements - Ethereal/High-end look */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />

            <div className="w-full max-w-[440px] z-10 space-y-8">
                {/* Logo IAACADEMY */}
                <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="h-12 w-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                        <span className="text-white font-medium text-2xl italic">IA</span>
                    </div>
                    <h2 className="text-xl font-medium tracking-tighter text-foreground">
                        IAACADEMY
                    </h2>
                </div>

                <Card className="border-border/50 bg-card/50 backdrop-blur-2xl shadow-2xl overflow-hidden rounded-3xl animate-in zoom-in-95 duration-500">
                    <CardContent className="p-8">
                        <div className="space-y-6">
                            <div className="text-center space-y-2">
                                <h1 className="text-2xl font-medium text-foreground tracking-tight">
                                    {isLogin ? "Bem-vindo de volta" : "Criar sua conta"}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {isLogin
                                        ? "Entre com suas credenciais para acessar a plataforma."
                                        : "Junte-se a nossa comunidade de criadores."}
                                </p>
                            </div>

                            <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-5">
                                {!isLogin && (
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-muted-foreground ml-1">Nome completo</Label>
                                        <Input
                                            id="name"
                                            placeholder="Seu nome"
                                            className="h-12 rounded-xl bg-muted/40 border-border focus:bg-muted/60 transition-all ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required={!isLogin}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-muted-foreground ml-1">E-mail</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="exemplo@email.com"
                                        className="h-12 rounded-xl bg-muted/40 border-border focus:bg-muted/60 transition-all ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between ml-1">
                                        <Label htmlFor="password" className="text-muted-foreground">Senha</Label>
                                        {isLogin && (
                                            <Link href="#" className="text-xs text-blue-500 hover:text-blue-400 font-medium transition-colors">
                                                Esqueceu a senha?
                                            </Link>
                                        )}
                                    </div>
                                    <div className="relative group">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="h-12 rounded-xl bg-muted/40 border-border pr-12 focus:bg-muted/60 transition-all ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {isLogin && (
                                    <div className="flex items-center gap-2 ml-1">
                                        <input type="checkbox" id="remember" className="rounded border-border bg-muted/40 text-blue-600 focus:ring-0 cursor-pointer" />
                                        <label htmlFor="remember" className="text-xs text-muted-foreground select-none cursor-pointer">
                                            Lembrar de mim
                                        </label>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.01] active:scale-[0.99] transition-all text-white font-medium shadow-xl shadow-blue-500/20 gap-2 border-t border-white/20"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            {success ? <CheckCircle2 size={18} className="animate-in zoom-in" /> : <Loader2 className="animate-spin" size={18} />}
                                            {isLogin ? "Entrando..." : "Criando conta..."}
                                        </>
                                    ) : (
                                        isLogin ? "Acessar Plataforma" : "Criar Minha Conta"
                                    )}
                                </Button>
                            </form>

                            <div className="pt-2 text-center text-sm">
                                <span className="text-muted-foreground">
                                    {isLogin ? "Ainda não tem uma conta?" : "Já possui uma conta?"}
                                </span>
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="ml-1 text-blue-500 hover:text-blue-400 font-medium underline-offset-4 hover:underline transition-all"
                                >
                                    {isLogin ? "Cadastre-se" : "Fazer login"}
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-muted-foreground/50 animate-in fade-in duration-1000 delay-500">
                    &copy; {new Date().getFullYear()} IAACADEMY. Todos os direitos reservados.
                </p>
            </div>
        </div>
    )
}
