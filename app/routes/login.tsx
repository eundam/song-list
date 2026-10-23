import { useState } from "react"
import { useAuthStore } from "../lib/auth-store"
import { useNavigate } from "react-router"

export default function LoginForm() {
  const { signIn, status } = useAuthStore()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault()
    try {
      await signIn(email, password)
      // alert("로그인 성공!")
      navigate("/")
    } catch (err: any) {
      alert(`로그인 실패: ${err.message}`)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <h2>{status}</h2>
      <input 
        type="email" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
        placeholder="이메일" />
      <input 
        type="password" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
        placeholder="비밀번호" />
      <button 
        type="submit" 
        disabled={status === "loading"}>
        {status === "loading" ? "인증 중..." : "로그인"}
      </button>
    </form>
  )
}