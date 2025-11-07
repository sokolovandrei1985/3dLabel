<template>
  <a-modal
    v-model:open="open"
    title="Регистрация"
    centered
    :width="400"
    :footer="null"
    :maskClosable="false"
    @cancel="handleCancel"
  >
    <a-form
      :model="formState"
      layout="vertical"
      @finish="handleSubmit"
    >
      <a-form-item
        label="Email"
        name="email"
        :rules="EMAIL_RULES"
      >
        <a-input
          v-model:value="formState.email"
          placeholder="email@example.com"
        />
      </a-form-item>

      <a-form-item
        label="Имя"
        name="firstName"
      >
        <a-input
          v-model:value="formState.firstName"
          placeholder="Введите имя"
        />
      </a-form-item>

      <a-form-item
        label="Фамилия"
        name="lastName"
      >
        <a-input
          v-model:value="formState.lastName"
          placeholder="Введите фамилию"
        />
      </a-form-item>

      <div class="form-actions">
        <a-button
          type="primary"
          html-type="submit"
          class="submit-button"
        >
          Зарегистрироваться
        </a-button>
        <a-button
          @click="handleCancel"
          class="cancel-button"
        >
          Отмена
        </a-button>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { EMAIL_RULES } from './rules'
//import type { Rule } from 'ant-design-vue/es/form'

interface Props {
  open: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'register', userData: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const open = ref(props.open)

interface FormState {
  email: string
  firstName?: string | null
  lastName?: string | null
}

const formState = ref<FormState>({
  email: '',
  firstName: null,
  lastName: null
})

// Синхронизация с props
watch(() => props.open, (newVal) => {
  open.value = newVal
})

watch(open, (newVal) => {
  emit('update:open', newVal)
})

// Отмена регистрации
const handleCancel = () => {
  open.value = false
  resetForm()
}

// Сброс формы
const resetForm = () => {
  formState.value = {
    email: '',
    firstName: null,
    lastName: null
  }
}

// Отправка формы
const handleSubmit = () => {
  // TODO: Запрос на бэкенд для регистрации
  console.log('Registration data:', formState.value)

  emit('register', { ...formState.value })
  resetForm()
}
</script>

<style scoped>
.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 32px;
}

.cancel-button,
.submit-button {
  min-width: 120px;
}
</style>