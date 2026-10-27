// import { useLoaderData, useNavigate, Link  } from 'react-router'
import { supabase } from '../lib/supabase'
import { useAuthStore } from "~/lib/auth-store"
import type { Route } from "./+types/list"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'


export function meta({}: Route.MetaArgs) {
  return [
    { title: "애창곡" },
    { name: "description", content: "나의 애창곡 리스트" },
  ];
}

export default function List() {
  const user = useAuthStore(s => s.user)
  // const githubSignIn = useAuthStore(s => s.githubSignIn)
  const queryClient = useQueryClient()
  // const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [rating, setRating] = useState(5)
  const [lyrics, setLyrics] = useState("")

  const { data: songs = [], isPending, isError, error } = useQuery({
    queryKey: ['songs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!user, // user가 있을 때만 쿼리 실행 (!!는 not의 not)

    // 5분 동안 신선한 상태 유지 (절대 서버에 다시 요청하지 않음)
    // staleTime이 줄어들다가 0이 되어도 자동으로 refetch되지는 않음
    // 다시 페이지를 방문했을 때 stale (시듬) 상태면 refetch됨
    staleTime: 1000 * 60 * 5, 
  })

  const deleteSongMutation = useMutation({
    mutationFn: async (songId: number) => {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', songId)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      // 삭제 성공 후, songs를 무효화하여 refetch되도록 함
      queryClient.invalidateQueries({ queryKey: ['songs'] })
    },
    onError: (err: any) => {
      alert(`노래 삭제 실패: ${err.message}`)
    }
  })

  const addSongMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('songs')
        .insert([{ title, artist, rating, lyrics }])
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      // 추가 성공 후, songs를 무효화하여 refetch되도록 함
      queryClient.invalidateQueries({ queryKey: ['songs'] })
      
      // 입력 필드 초기화
      setTitle("")
      setArtist("")
      setRating(5)
      setLyrics("")
    },
    onError: (err: any) => {
      alert(`노래 추가 실패: ${err.message}`)
    }
  })

  const addSongForm = () => (
    <form onSubmit={e => {
      e.preventDefault()
      addSongMutation.mutate()
    }}>
      <input
        type="text"
        value={title}
        placeholder="노래 제목 (*)"
        onChange={e => setTitle(e.target.value)}
        required/>
      <input
        type="text"
        value={artist}
        placeholder="가수 (*)"
        onChange={e => setArtist(e.target.value)}
        required/>
      <label>평점:</label>
      <input
        type="number"
        min="1"
        max="5"
        value={rating}
        onChange={e => setRating(parseInt(e.target.value))}
        required/>
      <textarea
        value={lyrics}
        placeholder="가사"
        onChange={e => setLyrics(e.target.value)}/>
      <button type="submit" disabled={addSongMutation.isPending}>
        노래 추가
      </button>
    </form>
  )

  if (!user) return null

  if (isPending) 
    return <p>노래 데이터를 불러오는 중...</p>

  if (isError) 
    return <p>에러 발생: {error.message}</p>

  if (songs.length === 0) 
    return <p>등록된 노래가 없거나 데이터를 불러오지 못했습니다.</p>

  return (
    <div>
      <div>
        { addSongForm() }

        <ul>
          {songs.map((song: any) => (
            <li key={song.id}>
              <strong>{song.title}</strong> - {song.artist || '(가수 없음)'}
              <button
                // 삭제 진행 중이면 버튼 비활성화
                disabled={deleteSongMutation.isPending} 
                onClick={() => {
                  if (confirm(`'${song.title}' 노래를 삭제하시겠습니까?`)) {
                    deleteSongMutation.mutate(song.id)
                  }
                }}>
                삭제
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
