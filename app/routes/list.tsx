import type { Route } from "./+types/list";
import { useLoaderData } from 'react-router'
import { supabase } from '../lib/supabase'

export function meta({}: Route.MetaArgs) {
  return [
    { title: "애창곡" },
    { name: "description", content: "나의 애창곡 리스트" },
  ];
}

export async function clientLoader() {

  //-------------------------------------------------------
  // 로그인 시도
  //-------------------------------------------------------
  const { error } = await supabase.auth.signInWithPassword({
      email: "gdhong@test.com",
      password: "pass123",
    })
  
  if (error) {
    alert(`로그인 실패: ${error.message}`)
    console.log("로그인 실패", error.message)
    return { songs: [], user: null }
  }

  //-------------------------------------------------------
  // 세션 확인
  //-------------------------------------------------------
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    console.log("로그인 세션 없음")
    return { songs: [], user: null }
  }

  //-------------------------------------------------------
  // 노래 데이터 불러오기
  //-------------------------------------------------------
  const { data, error: songsError } = await supabase
    .from('songs')
    .select('*')
  
  if (songsError) {
    console.log("노래 데이터 불러오기 실패", songsError.message)
    return { songs: [], user: session.user }
  }

  return { songs: data, user: session.user }
}

export default function List() {
  const { songs, user } = useLoaderData<typeof clientLoader>()

    return (
    <div>
      <h2>애창곡 리스트 ({user?.email})</h2>
      {songs.length === 0 ? (
        <p>등록된 노래가 없거나 데이터를 불러오지 못했습니다.</p>
      ) : (
        <ul>
          {songs.map((song: any) => (
            <li key={song.id}>
              <strong>{song.title}</strong> - {song.artist || '(가수 없음)'}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
