/**
 * @return Kracker:#{entityName}:#{id}
 * @params entityName: 테이블명, id: 고유 id
 */
export const fnGenerateRedisKey = (entityName: string, id: number) => `Kracker:${entityName}:${id}`;
