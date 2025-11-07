<template>
  <div class="auth-user">
    <a-popover
      v-model:open="showPopup"
      trigger="click"
      placement="bottomRight"
      :arrow="false"
    >
      <a-button
        class="user-button"
        ghost
        @click="showPopup = !showPopup"
      >
        <template #icon>
          <UserOutlined :style="{ color: '#1677ff' }"/>
        </template>
        {{ getUserName }}
      </a-button>
      <template #content>
        <!-- Авторизованный пользователь -->
        <div v-if="isAuthorized" class="auth-popup">
          <a-button
            type="primary"
            danger
            @click="handleLogout"
            class="logout-button"
          >
            Выйти
          </a-button>
        </div>

        <!-- Неавторизованный пользователь -->
        <div v-else class="unauth-popup">
          <a-form
            :model="loginForm"
            layout="vertical"
            @finish="handleLogin"
          >
            <a-form-item
              label="Email"
              name="email"
              :rules="EMAIL_RULES"
            >
              <a-input
                v-model:value="loginForm.email"
                placeholder="email@mail.ru"
              />
            </a-form-item>

            <div class="button-group">
              <a-button
                type="primary"
                html-type="submit"
                class="login-button"
              >
                Войти
              </a-button>
              <a-button
                @click="showRegisterModal = true"
                class="register-button"
              >
                Зарегистрироваться
              </a-button>
            </div>
          </a-form>
        </div>
      </template>
    </a-popover>

    <!-- Модальное окно регистрации -->
    <RegisterUser
      v-model:open="showRegisterModal"
      @register="handleRegister"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { useApplicationStore } from '@/stores/application'
import RegisterUser from '@/components/auth/RegisterUser.vue'
import { EMAIL_RULES } from './rules'
import { storeToRefs } from 'pinia'
import { UserOutlined } from '@ant-design/icons-vue'

const applicationStore = useApplicationStore()
const { setAuthUser } = applicationStore
const { isAuthorized, getUserName } = storeToRefs(applicationStore)

const showPopup = ref(false)
const showRegisterModal = ref(false)

const loginForm = ref({
  email: ''
})

// Выход из системы
const handleLogout = () => {
  setAuthUser(null)
  //showPopup.value = false
  message.success('Вы успешно вышли из системы')
}

// Вход в систему
const handleLogin = () => {
  // TODO: Запрос на бэкенд для входа
  console.log('Login attempt with:', loginForm.value)

  // Временная заглушка
  const user = {
    email: loginForm.value.email
  }
  setAuthUser(user)
  showPopup.value = false
  message.success('Успешный вход в систему')
}

// Обработка регистрации
const handleRegister = (userData: any) => {
  // TODO: Запрос на бэкенд для регистрации
  console.log('Register attempt with:', userData)

  setAuthUser(userData)
  showPopup.value = false
  showRegisterModal.value = false
  message.success('Регистрация прошла успешно')
}
</script>

<style scoped>
.auth-user {
  display: inline-block;
}

.user-button {
  min-width: 200px;
  color: rgba(0, 0, 0, 0.88);
  border-color: #d9d9d9;
}

.user-button:hover {
  color: black;
  border-color: black;
}

.auth-user {
  display: flex;
  justify-content: end;
}

.unauth-popup {
  min-width: 250px;
}

.button-group {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.login-button,
.register-button {
  flex: 1;
}
</style>