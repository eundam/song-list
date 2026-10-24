import { useState } from "react"
import { useAuthStore } from "../lib/auth-store"
import { useNavigate } from "react-router"

export default function SignupForm() {
  const { signUp, status } = useAuthStore()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSignup = async (e: React.SubmitEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      return alert("비밀번호가 일치하지 않습니다.")
    }

    try {
      await signUp(email, password)
      alert("Email 확인하여 인증하시기 바랍니다.")
      navigate("/")
    } catch (err: any) {
      alert(`회원가입 실패: ${err.message}`)
    }
  }

  return (
    <form onSubmit={handleSignup}>
      <h2>Email 회원가입 ({status})</h2>
      <input 
        type="email" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
        placeholder="이메일" 
        required
      />
      <input 
        type="password" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
        placeholder="비밀번호" 
        required
      />
      <input 
        type="password" 
        value={confirmPassword} 
        onChange={e => setConfirmPassword(e.target.value)} 
        placeholder="비밀번호 확인" 
        required
      />
      <button 
        type="submit" 
        disabled={status === "loading"}>
        {status === "loading" ? "등록 중..." : "회원가입"}
      </button>
    </form>
  )
}
