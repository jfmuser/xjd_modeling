<script setup>
import { useRouter } from 'vue-router';
import Router from '../router/routers/router';
import { onMounted, reactive, ref } from 'vue';
import useAuthStore from '@/stores/auth.store';
import { ElMessage } from 'element-plus';
import ActiveAccount from '../components/dept/ActiveAccount.vue';
import useSiteStore from '../stores/dept/site.store';

const authStore = useAuthStore();
const siteStore = useSiteStore()

const activeAccountRef = ref(null);


const router = useRouter()
function jumpRouterFn(arr) {
    let routerList = router.getRoutes()
    const haveRouterList = []
    arr.forEach(item => {
        if (item.name === 'activateSite') return
        haveRouterList.push(item.name)
    })
    let jumpRouter = routerList.find(item => haveRouterList.includes(item.name))
    router.push({ path: jumpRouter.path })
}


// 是否显示弹框
const visible = ref(false);
onMounted(async () => {
    //判断此平台是否注册了参与方,如果没有就跳回登录页注册
    if (!siteStore.mySite) {
        activeAccountRef.value.show()
        return
    }
    jumpRouterFn(Router)
    // initCodeShow();
});

// const initCodeShow = () => {
//     const code = localStorage.getItem('code');
//     if (code === '10101') {
//         visible.value = true;
//     } else {
//         visible.value = false;
//         jumpRouterFn(Router)
//     }
// };




</script>
<template>
    <ActiveAccount ref="activeAccountRef" />
</template>