import ScrollListFeed from '@components/post/scroll-list';

interface IProps {
  items: any[];
  total: number;
  onDeleteFeed(): Function;
  loadMore(): Function;
  loading: boolean;
}

const UserFeedBookmarks = ({
  onDeleteFeed,
  loadMore,
  items,
  total,
  loading
}: IProps) => (
  <>
    <ScrollListFeed
      items={items.filter((i) => i?.objectInfo)}
      canLoadmore={items && items.length < total}
      loading={loading}
      onDelete={onDeleteFeed}
      loadMore={loadMore}
    />
  </>
);

export default UserFeedBookmarks;
