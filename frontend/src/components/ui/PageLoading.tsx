export default function PageLoading({ message }: { message: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-center text-gray-400">{message}</p>
    </div>
  )
}
