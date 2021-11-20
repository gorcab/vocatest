export class Page<DataType> {
  page: number;
  perPage: number;
  total: number;
  totalPage: number;
  data: DataType;

  constructor(data: DataType, page: number, total: number, perPage: number) {
    this.page = page;
    this.perPage = perPage;
    this.total = total;
    this.totalPage = Math.ceil(total / perPage);
    this.data = data;
  }
}
