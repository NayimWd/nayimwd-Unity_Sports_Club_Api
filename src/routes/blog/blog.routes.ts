import { Router } from "express";
import { veryfyJWT } from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.middleware";
import {
  createBlog,
  updateBlog,
  updateBlogPhoto,
  blogPublish,
  getAllBlogs,
  manageBlogs,
  blogDetails,
} from "../../controller/blogs";
import { cacheMiddleware } from "../../infrastructure/cache/cacheMiddleware";
import {
  CacheGroups,
  cacheKeys,
} from "../../infrastructure/cache/utils/cacheKeys";
import { invalidateCacheMiddleware } from "../../infrastructure/cache/invalidCacheMiddleware";

const router = Router();

// blog types
type Blog = {
  create: "/create";
  update: "/update/:blogId";
  updatePhoto: "/updatPhoto/:blogId";
  publishStatus: "/publishStatus/:blogId";
  getAll: "/getAll";
  manage: "/manage";
  details: "/details/:blogId";
};

// blog routes
const blog: Blog = {
  create: "/create",
  update: "/update/:blogId",
  updatePhoto: "/updatPhoto/:blogId",
  publishStatus: "/publishStatus/:blogId",
  getAll: "/getAll",
  manage: "/manage",
  details: "/details/:blogId",
};

// Create blog
router
  .route(blog.create)
  .post(
    veryfyJWT,
    upload.single("photo"),
    invalidateCacheMiddleware([CacheGroups.BLOG_LIST]),
    createBlog
  );

// Update blog
router
  .route(blog.update) // MUST include :blogId => e.g. "/blogs/:blogId"
  .patch(
    veryfyJWT,
    (req, res, next) => {
      invalidateCacheMiddleware([
        CacheGroups.BLOG(req.params.blogId),
        CacheGroups.BLOG_LIST,
      ])(req, res, next);
    },
    updateBlog
  );

// Update blog photo
router
  .route(blog.updatePhoto) // path MUST include :blogId
  .patch(
    veryfyJWT,
    upload.single("photo"),
    (req, res, next) => {
      invalidateCacheMiddleware([
        CacheGroups.BLOG(req.params.blogId),
        CacheGroups.BLOG_LIST,
      ])(req, res, next);
    },
    updateBlogPhoto
  );

// Update publish status
router
  .route(blog.publishStatus) // MUST include :blogId
  .patch(
    veryfyJWT,
    (req, res, next) => {
      invalidateCacheMiddleware([
        CacheGroups.BLOG(req.params.blogId),
        CacheGroups.BLOG_LIST,
      ])(req, res, next);
    },
    blogPublish
  );

// Get all blogs
router.route(blog.getAll).get(
  cacheMiddleware({
    key: cacheKeys.blogList,
    ttl: 120,
    groups: [CacheGroups.BLOG_LIST],
  }),
  getAllBlogs
);

// Manage blogs
router.route(blog.manage).get(
  veryfyJWT,
  cacheMiddleware({
    key: cacheKeys.blogList,
    ttl: 60,
    groups: [CacheGroups.BLOG_LIST],
  }),
  manageBlogs
);

// Blog details
router.route(blog.details).get((req, res, next) => {
  cacheMiddleware({
    key: cacheKeys.blogDetails(req.params.blogId),
    groups: [CacheGroups.BLOG(req.params.blogId)],
    ttl: 60
  })(req, res, next);
}, blogDetails);

export default router;
