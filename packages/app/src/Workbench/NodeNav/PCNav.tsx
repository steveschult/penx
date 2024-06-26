import { Box } from '@fower/react'
import { EDITOR_NAV_WIDTH } from '@penx/constants'
import { useNodeContext } from '@penx/hooks'
import { PaletteDrawer } from '../PaletteDrawer'
import { Breadcrumb } from './Breadcrumb'
import { ClosePanelButton } from './ClosePanelButton'
import { FavoriteButton } from './FavoriteButton'
import { MorePopover } from './MorePopover'
import { PublishPopover } from './PublishPopover'

export const PCNav = () => {
  const { node } = useNodeContext()

  return (
    <Box
      h={EDITOR_NAV_WIDTH}
      sticky
      top0
      toCenterY
      toBetween
      px2
      display={['none', 'none', 'inline-flex']}
      w-100p
      bgWhite
      zIndex-10
    >
      <Breadcrumb />
      <Box>
        <PublishPopover />
        <FavoriteButton />
        <ClosePanelButton />
        <MorePopover />
      </Box>
    </Box>
  )
}
