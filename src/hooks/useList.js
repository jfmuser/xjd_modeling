import { computed, onMounted, reactive, toRefs } from 'vue';
import { useRouter, useRoute } from 'vue-router';

export default function (fetchListRequest) {
  const route = useRoute();
  const router = useRouter();
  const routePage = computed(() => Number(route.query.page || 1));
  const routeSearch = computed(() => route.query.search || '');

  const result = reactive({
    loading: false,
    list: [],
    total: 0,
    currentPage: routePage.value,
    pageSize: 10,
    search: routeSearch.value,
  });

  onMounted(() => {
    fetchList();
  });

  const fetchList = async ({ page = 1 } = {}) => {
    try {
      result.loading = true;
      const response = await fetchListRequest({
        currentPage: page || result.currentPage,
        search: result.search,
        size: result.pageSize,
      });
      const { data, records, total, size, current } = response;
      if (records) {
        result.list = records;
        result.total = total;
        result.pageSize = size;
        result.currentPage = current;
      } else {
        result.list = data.map((item) => ({ ...Object.values(item)[0] }));
        result.total = Object.keys(data).length;
      }
    } catch (error) {
      console.error(error);
    } finally {
      result.loading = false;
    }
  };

  const onPageChange = (page) => {
    fetchList({ page });
    router.replace({ name: route.name, query: { ...route.query, page } });
  };

  const onSearch = () => {
    fetchList({ page: 1 });
    router.replace({
      name: route.name,
      query: { ...route.query, page: 1, search: result.search },
    });
  };

  return {
    ...toRefs(result),
    onPageChange,
    fetchList,
    onSearch,
  };
}
