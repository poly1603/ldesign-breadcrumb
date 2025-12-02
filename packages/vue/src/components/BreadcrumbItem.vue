<script setup lang="ts">
/**
 * 面包屑项组件
 * @component LBreadcrumbItem
 */
import type { BreadcrumbItem } from '@ldesign/breadcrumb-core'
import { hasDropdown, isItemClickable } from '@ldesign/breadcrumb-core'
import { computed, inject, ref } from 'vue'
import { BREADCRUMB_CONTEXT_KEY } from '../composables/useBreadcrumb'
import BreadcrumbDropdown from './BreadcrumbDropdown.vue'

/**
 * 组件 Props
 */
export interface BreadcrumbItemProps {
  /**
   * 面包屑项数据
   */
  item: BreadcrumbItem

  /**
   * 项索引
   */
  index: number

  /**
   * 是否为最后一项
   */
  isLast?: boolean
}

/**
 * 组件 Emits
 */
export interface BreadcrumbItemEmits {
  (e: 'click', item: BreadcrumbItem, index: number, event: MouseEvent): void
}

const props = withDefaults(defineProps<BreadcrumbItemProps>(), {
  isLast: false,
})

const emit = defineEmits<BreadcrumbItemEmits>()

// 注入上下文
const context = inject(BREADCRUMB_CONTEXT_KEY)

// 下拉菜单状态
const dropdownVisible = ref(false)

// 是否可点击
const clickable = computed(() => {
  return isItemClickable(
    props.item,
    props.isLast,
    context?.lastItemClickable.value ?? false,
  )
})

// 是否有下拉菜单
const showDropdown = computed(() => hasDropdown(props.item))

// CSS 类
const itemClass = computed(() => ({
  'l-breadcrumb-item': true,
  'l-breadcrumb-item--disabled': props.item.disabled,
  'l-breadcrumb-item--clickable': clickable.value,
  'l-breadcrumb-item--last': props.isLast,
  'l-breadcrumb-item--with-dropdown': showDropdown.value,
}))

/**
 * 处理点击事件
 */
function handleClick(event: MouseEvent) {
  if (!clickable.value || props.item.disabled) {
    event.preventDefault()
    return
  }

  emit('click', props.item, props.index, event)
}

/**
 * 切换下拉菜单
 */
function toggleDropdown() {
  if (showDropdown.value) {
    dropdownVisible.value = !dropdownVisible.value
  }
}
</script>

<template>
  <span :class="itemClass">
    <!-- 链接模式 -->
    <a
      v-if="item.href && clickable"
      :href="item.href"
      :target="item.target || '_self'"
      class="l-breadcrumb-item__link"
      @click="handleClick"
    >
      <span v-if="item.icon" class="l-breadcrumb-item__icon">
        <slot name="icon" :icon="item.icon">
          {{ item.icon }}
        </slot>
      </span>
      <span class="l-breadcrumb-item__label">
        <slot :item="item">{{ item.label }}</slot>
      </span>
    </a>

    <!-- 可点击文本模式 -->
    <button
      v-else-if="clickable && !item.disabled"
      type="button"
      class="l-breadcrumb-item__button"
      @click="handleClick"
    >
      <span v-if="item.icon" class="l-breadcrumb-item__icon">
        <slot name="icon" :icon="item.icon">
          {{ item.icon }}
        </slot>
      </span>
      <span class="l-breadcrumb-item__label">
        <slot :item="item">{{ item.label }}</slot>
      </span>
    </button>

    <!-- 纯文本模式 -->
    <span v-else class="l-breadcrumb-item__text">
      <span v-if="item.icon" class="l-breadcrumb-item__icon">
        <slot name="icon" :icon="item.icon">
          {{ item.icon }}
        </slot>
      </span>
      <span class="l-breadcrumb-item__label">
        <slot :item="item">{{ item.label }}</slot>
      </span>
    </span>

    <!-- 下拉菜单触发器 -->
    <button
      v-if="showDropdown"
      type="button"
      class="l-breadcrumb-item__dropdown-trigger"
      :aria-expanded="dropdownVisible"
      @click.stop="toggleDropdown"
    >
      <span class="l-breadcrumb-item__dropdown-arrow">▼</span>
    </button>

    <!-- 下拉菜单 -->
    <BreadcrumbDropdown
      v-if="showDropdown && dropdownVisible"
      :items="item.children!"
      :parent-item="item"
      @close="dropdownVisible = false"
    />
  </span>
</template>

