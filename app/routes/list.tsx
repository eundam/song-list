import type { Route } from "./+types/list";
import { useLoaderData } from 'react-router'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useAuthStore } from "~/lib/auth-store";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "애창곡" },
    { name: "description", content: "나의 애창곡 리스트" },
  ];
}

export async function clientLoader() {

  //-------------------------------------------------------
  // 세션 확인
  //-------------------------------------------------------
  if (useAuthStore.getState().status === "loading") {
    // 로그인 상태가 아직 로딩 중이면, 세션을 확인하고 상태를 업데이트
    const { data: { session } } = await supabase.auth.getSession()
    useAuthStore.getState().setSession(session)
  }

  if (!useAuthStore.getState().session) {
    console.log("로그인 세션 없음")
    return { songs: [] }
  }

  //-------------------------------------------------------
  // 노래 데이터 불러오기
  //-------------------------------------------------------
  const { data, error: songsError } = await supabase
    .from('songs')
    .select('*')
  
  if (songsError) {
    console.log("노래 데이터 불러오기 실패", songsError.message)
    return { songs: [] }
  }

  return { songs: data }
}

export default function List() {
  const { songs } = useLoaderData<typeof clientLoader>()
  const user = useAuthStore(s => s.user)

  return (
    <div>
      <h2>애창곡 리스트 {user && `(${user.email})`}</h2>
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
