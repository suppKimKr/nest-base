import { FilterResponseDto } from './filter-response.dto';
import { FilterResult } from './filter.result';

export class FilterResponse<T> {
    public results: FilterResponseDto[];

    constructor({ result }: FilterResult<T>, type?: string) {
        let resultArray = [];
        const StringIsNotNumber = (obj: FilterResponseDto) => isNaN(Number(obj.key)) === true;
        Object.keys(result).map((key) => {
            const dto = new FilterResponseDto();
            dto.key = key;
            dto.value = result[key];
            resultArray.push(dto);
        });
        this.results = type ? resultArray : resultArray.filter(StringIsNotNumber);
    }
}
