# v-number-only-directive

### 注册使用
```
// 全局注册（推荐）
import Vue from 'vue'
import NumberOnly from 'v-number-only-directive'

Vue.use(NumberOnly)

// 或者手动注册
import { NumberOnlyDirective } from 'v-number-only-directive'
Vue.directive('number-only', NumberOnlyDirective)

```

### 使用示例
```
<!-- 只允许正整数 -->
<el-input v-model="val1" v-number-only placeholder="正整数" />

<!-- 允许小数，限制2位 -->
<el-input
  v-model="val2"
  v-number-only="{ decimal: true, maxDecimalPlaces: 2 }"
  placeholder="小数 2 位"
/>

<!-- 允许负数、小数、范围限制 -->
<el-input
  v-model="val3"
  v-number-only="{ decimal: true, negative: true, min: -100, max: 100 }"
  placeholder="-100 ~ 100"
/>

<!-- 不允许空，自动补 0 -->
<el-input
  v-model="val4"
  v-number-only="{ allowEmpty: false }"
  placeholder="不允许空值"
/>
```

### 功能一览
| 功能        | 描述                    |默认值                    |
| --------- | --------------------- |--------------------- |
| 支持小数点     | `decimal: true`       |  false       |
| 支持负号      | `negative: true`      | false       |
| 限制小数位数    | `maxDecimalPlaces: 2` | 无限制       |
| 限制输入范围    | `min: 0, max: 100`    | 无限制       |
| 可配置是否允许空值 | `allowEmpty: false`   | true       |

