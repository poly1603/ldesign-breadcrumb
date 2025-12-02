<script setup lang="ts">
/**
 * 面包屑下拉菜单组件
 * @component LBreadcrumbDropdown
 */
import type { BreadcrumbDropdownItem, BreadcrumbItem } from '@ldesign/breadcrumb-core'
import { onMounted, onUnmounted, ref } from 'vue'

/**
 * 组件 Props
 */
export interface BreadcrumbDropdownProps {
  /**
   * 下拉菜单项列表
   */
  items: BreadcrumbDropdownItem[]

  /**
   * 父级面包屑项
   */
  parentItem: BreadcrumbItem
}

/**
 * 组件 Emits
 */
export interface BreadcrumbDropdownEmits {
  (e: 'select', item: BreadcrumbDropdownItem, event: MouseEvent): void
  (e: 'close'): void
}

const props = defineProps<BreadcrumbDropdownProps>()
const emit = defineEmits<BreadcrumbDropdownEmits>()

const dropdownRef = ref<HTMLElement | null>(null)

/**
 * 处理菜单项点击
 */
function handleItemClick(item: BreadcrumbDropdownItem, event: MouseEvent) {
  if (item.disabled) {
    event.preventDefault()
    return
  }

  emit('select', item, event)
  emit('close')
}

/**
 * 处理点击外部关闭
 */
function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    emit('close')
  }
}

/**
 * 处理键盘事件
 */
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    ref="dropdownRef"
    class="l-breadcrumb-dropdown"
    role="menu"
    :aria-label="`${parentItem.label} 子菜单`"
  >
    <ul class="l-breadcrumb-dropdown__list">
      <li
        v-for="item in items"
        :key="item.key"
        class="l-breadcrumb-dropdown__item"
        :class="{
          'l-breadcrumb-dropdown__item--disabled': item.disabled,
        }"
        role="menuitem"
      >
        <a
          v-if="item.href"
          :href="item.href"
          class="l-breadcrumb-dropdown__link"
          @click="handleItemClick(item, $event)"
        >
          <span v-if="item.icon" class="l-breadcrumb-dropdown__icon">
            {{ item.icon }}
          </span>
          <span class="l-breadcrumb-dropdown__label">{{ item.label }}</span>
        </a>
        <button
          v-else
          type="button"
          class="l-breadcrumb-dropdown__button"
          :disabled="item.disabled"
          @click="handleItemClick(item, $event)"
        >
          <span v-if="item.icon" class="l-breadcrumb-dropdown__icon">
            {{ item.icon }}
          </span>
          <span class="l-breadcrumb-dropdown__label">{{ item.label }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

