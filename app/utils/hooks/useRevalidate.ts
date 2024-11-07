import { useNavigate } from '@remix-run/react'
import { useEffect , useCallback } from 'react'


export const useRevalidate = () => {
	// We get the navigate function from React Rotuer
	let navigate = useNavigate()
	// And return a function which will navigate to `.` (same URL) and replace it
	return useCallback(
		function revalidate() {
			navigate('.', { replace: true })
		},
		[navigate],
	)
}
export const useRevalidateOnInterval = ({
	enabled = false,
	interval = 1000,
}: {
	enabled?: boolean
	interval?: number
}) => {
	let revalidate = useRevalidate()
	useEffect(
		function revalidateOnInterval() {
			if (!enabled) return
			let intervalId = setInterval(revalidate, interval)
			return () => clearInterval(intervalId)
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[revalidate],
	)
}
