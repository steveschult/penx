import { Box } from '@fower/react'
import { useQuery } from '@tanstack/react-query'
import { LockKeyhole } from 'lucide-react'
import { useAccount } from 'wagmi'
import { Button, Card, Spinner } from 'uikit'
import { useSpaces } from '@penx/hooks'
import { db } from '@penx/local-db'
import { trpc } from '@penx/trpc-client'

interface Props {
  token: string
  q: string
  installationId: number
}

export function Repos({ installationId, q, token }: Props) {
  const { address = '' } = useAccount()
  const { activeSpace } = useSpaces()
  // const { refetch, isFetching: isSpaceFetching } = useSpace()
  const {
    data = [],
    isLoading,
    isFetching,
  } = useQuery(['searchRepo'], () =>
    trpc.github.searchRepo.query({
      q,
      installationId: Number(installationId),
      token,
    }),
  )

  // const { mutateAsync, isLoading: isConnecting } =
  //   api.space.connectRepo.useMutation()
  // const loading = isConnecting || isSpaceFetching
  // const loading = isSpaceFetching

  const h = 383

  // if (isFetching) {
  //   return (
  //     <Card h={h} toCenter>
  //       <Box toCenterY gap2>
  //         <Spinner />
  //         <Box>Loading repos...</Box>
  //       </Box>
  //     </Card>
  //   )
  // }

  // if (!data?.length) {
  //   return (
  //     <Card toCenter gray400 h={h}>
  //       No repos found
  //     </Card>
  //   )
  // }

  return (
    <Box column gap2 border borderGray100 mt2 roundedXL>
      {data.map((item) => (
        <Box
          key={item.id}
          toBetween
          toCenterY
          borderBottom
          borderBottomGray100
          px4
          py3
        >
          <Box toCenterY gap1>
            <Box textBase>{item.name}</Box>
            {item.private && (
              <Box gray600>
                <LockKeyhole size={16} />
              </Box>
            )}
          </Box>
          <Button
            size="sm"
            colorScheme="black"
            // disabled={loading}
            onClick={async () => {
              await trpc.user.connectRepo.mutate({
                address,
                spaceId: activeSpace.id,
                installationId,
                repoName: item.full_name,
              })
              // await refetch()
            }}
          >
            {isLoading && <Spinner />}
            <Box>Connect</Box>
          </Button>
        </Box>
      ))}
    </Box>
  )
}
