export interface Article {
    type_of: string;
    id: number;
    title: string;
    description: string;
    readable_publish_date: string;
    slug: string;
    path: string;
    url: string;
    comments_count: number;
    public_reactions_count: number;
    collection_id: number | null;
    published_timestamp: string;
    positive_reactions_count: number;
    cover_image: string | null;
    social_image: string;
    canonical_url: string;
    created_at: string;
    edited_at: string | null;
    crossposted_at: string | null;
    published_at: string;
    last_comment_at: string;
    reading_time_minutes: number;
    tag_list: string[] | string;
    tags: string;
    body_html?: string;
    body_markdown?: string;
    user: UserSummary;
    organization?: OrganizationSummary;
    flare_tag?: FlareTag;
}

export interface ArticleCreate {
    title: string;
    body_markdown?: string;
    published?: boolean;
    series?: string | null;
    main_image?: string;
    canonical_url?: string;
    description?: string;
    tags?: string[];
    organization_id?: number;
}

export interface ArticleUpdate {
    title?: string;
    body_markdown?: string;
    published?: boolean;
    series?: string | null;
    main_image?: string;
    canonical_url?: string;
    description?: string;
    tags?: string[];
    organization_id?: number;
}

export interface UserSummary {
    name: string;
    username: string;
    twitter_username: string | null;
    github_username: string | null;
    user_id: number;
    website_url: string | null;
    profile_image: string;
    profile_image_90: string;
}

export interface User {
    type_of: string;
    id: number;
    username: string;
    name: string;
    summary: string | null;
    twitter_username: string | null;
    github_username: string | null;
    website_url: string | null;
    location: string | null;
    joined_at: string;
    profile_image: string;
}

export interface Comment {
    type_of: string;
    id_code: string;
    created_at: string;
    body_html: string;
    user: UserSummary;
    children: Comment[];
}

export interface Tag {
    id: number;
    name: string;
    bg_color_hex: string | null;
    text_color_hex: string | null;
}

export interface FollowedTag {
    id: number;
    name: string;
    points: number;
}

export interface Organization {
    type_of: string;
    username: string;
    name: string;
    summary: string | null;
    twitter_username: string | null;
    github_username: string | null;
    url: string;
    location: string | null;
    joined_at: string;
    tech_stack: string | null;
    tag_line: string | null;
    story: string | null;
    profile_image: string;
}

export interface OrganizationSummary {
    name: string;
    username: string;
    slug: string;
    profile_image: string;
    profile_image_90: string;
}

export interface Follower {
    type_of: string;
    id: number;
    created_at: string;
    user_id: number;
    name: string;
    path: string;
    username: string;
    profile_image: string;
}

export interface ReadingListItem {
    type_of: string;
    id: number;
    status: string;
    created_at: string;
    article: Article;
}

export interface Reaction {
    result: string;
    category: string;
    id: number;
    reactable_id: number;
    reactable_type: string;
}

export interface FlareTag {
    name: string;
    bg_color_hex: string;
    text_color_hex: string;
}

export interface ProfileImage {
    type_of: string;
    image_of: string;
    profile_image: string;
    profile_image_90: string;
}

export interface ApiError {
    error: string;
    status: number;
}
