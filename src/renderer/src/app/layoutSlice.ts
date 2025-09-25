import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type WidgetType = 'cpu' | 'memory' | 'disk' | 'network' | 'processes'

interface Widget {
  id: string
  type: WidgetType
  position: { x: number; y: number }
  size: { width: number; height: number }
  visible: boolean
}

interface LayoutState {
  widgets: Widget[]
  gridColumns: number
  gridRows: number
  sidebarCollapsed: boolean
  fullscreenWidget: string | null
}

const defaultWidgets: Widget[] = [
  {
    id: 'cpu-1',
    type: 'cpu',
    position: { x: 0, y: 0 },
    size: { width: 6, height: 4 },
    visible: true
  },
  {
    id: 'memory-1',
    type: 'memory',
    position: { x: 6, y: 0 },
    size: { width: 6, height: 4 },
    visible: true
  },
  {
    id: 'disk-1',
    type: 'disk',
    position: { x: 0, y: 4 },
    size: { width: 6, height: 4 },
    visible: true
  },
  {
    id: 'network-1',
    type: 'network',
    position: { x: 6, y: 4 },
    size: { width: 6, height: 4 },
    visible: true
  },
  {
    id: 'processes-1',
    type: 'processes',
    position: { x: 0, y: 8 },
    size: { width: 12, height: 4 },
    visible: true
  }
]

const initialState: LayoutState = {
  widgets: defaultWidgets,
  gridColumns: 12,
  gridRows: 12,
  sidebarCollapsed: false,
  fullscreenWidget: null
}

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    updateWidgetPosition: (
      state,
      action: PayloadAction<{ id: string; position: { x: number; y: number } }>
    ) => {
      const widget = state.widgets.find(w => w.id === action.payload.id)
      if (widget) {
        widget.position = action.payload.position
      }
    },
    updateWidgetSize: (
      state,
      action: PayloadAction<{ id: string; size: { width: number; height: number } }>
    ) => {
      const widget = state.widgets.find(w => w.id === action.payload.id)
      if (widget) {
        widget.size = action.payload.size
      }
    },
    toggleWidgetVisibility: (state, action: PayloadAction<string>) => {
      const widget = state.widgets.find(w => w.id === action.payload)
      if (widget) {
        widget.visible = !widget.visible
      }
    },
    addWidget: (state, action: PayloadAction<Omit<Widget, 'id'>>) => {
      const id = `${action.payload.type}-${Date.now()}`
      state.widgets.push({ ...action.payload, id })
    },
    removeWidget: (state, action: PayloadAction<string>) => {
      state.widgets = state.widgets.filter(w => w.id !== action.payload)
    },
    toggleSidebar: state => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setFullscreenWidget: (state, action: PayloadAction<string | null>) => {
      state.fullscreenWidget = action.payload
    },
    resetLayout: () => initialState
  }
})

export const {
  updateWidgetPosition,
  updateWidgetSize,
  toggleWidgetVisibility,
  addWidget,
  removeWidget,
  toggleSidebar,
  setFullscreenWidget,
  resetLayout
} = layoutSlice.actions

export default layoutSlice.reducer
